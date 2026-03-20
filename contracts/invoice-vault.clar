;; ---------------------------------------------------------
;; INVOICE VAULT
;; Fractional, yield-bearing escrow for developers
;; ---------------------------------------------------------

;; Constants and Errors
(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-escrow-not-found (err u101))
(define-constant err-invalid-status (err u102))
(define-constant err-already-funded (err u103))
(define-constant err-math-overflow (err u104))
(define-constant err-nothing-to-claim (err u105))

;; Status Constants
(define-constant STATUS_LOCKED "LOCKED")
(define-constant STATUS_TOKENIZED "TOKENIZED")
(define-constant STATUS_SETTLED "SETTLED")

;; ---------------------------------------------------------
;; Data Maps
;; ---------------------------------------------------------

;; Tracks the next escrow ID
(define-data-var next-escrow-id uint u1)

;; Main Escrow Map
(define-map escrows 
  { escrow-id: uint } 
  { 
    dao: principal, 
    builder: principal, 
    amount-locked: uint,      ;; The payout amount (simulating USDCx)
    status: (string-ascii 20),
    discount-bps: uint,       ;; The discount the builder accepts (e.g., 1000 = 10%)
    total-funded: uint        ;; Amount of funding received (simulating sBTC)
  }
)

;; Fractional Ownership Map
(define-map investors 
  { escrow-id: uint, investor: principal } 
  { 
    share-bps: uint,          ;; Percentage of the final payout they own
    amount-invested: uint     ;; Amount they put in
  }
)

;; ---------------------------------------------------------
;; Core Functions
;; ---------------------------------------------------------

;; 1. CREATE ESCROW (Called by DAO)
;; DAO locks funds into the contract for a specific builder.
(define-public (create-escrow (builder principal) (amount uint))
  (let 
    (
      (escrow-id (var-get next-escrow-id))
    )
    ;; Transfer funds from DAO to this contract (Simulating USDCx lock)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Create the escrow record
    (map-insert escrows 
      { escrow-id: escrow-id }
      {
        dao: tx-sender,
        builder: builder,
        amount-locked: amount,
        status: STATUS_LOCKED,
        discount-bps: u0,
        total-funded: u0
      }
    )
    
    ;; Increment ID
    (var-set next-escrow-id (+ escrow-id u1))
    (ok escrow-id)
  )
)

;; 2. TOKENIZE INVOICE (Called by Builder)
;; Builder offers their locked payout to the market at a discount.
(define-public (tokenize-invoice (escrow-id uint) (discount-bps uint))
  (let 
    (
      (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) err-escrow-not-found))
    )
    ;; Only the assigned builder can tokenize their invoice
    (asserts! (is-eq tx-sender (get builder escrow)) err-not-authorized)
    ;; Must be in LOCKED status
    (asserts! (is-eq (get status escrow) STATUS_LOCKED) err-invalid-status)
    ;; Discount must be reasonable (e.g., less than 50%)
    (asserts! (< discount-bps u5000) err-math-overflow)
    
    ;; Update status to TOKENIZED
    (ok (map-set escrows 
      { escrow-id: escrow-id }
      (merge escrow { status: STATUS_TOKENIZED, discount-bps: discount-bps })
    ))
  )
)

;; 3. FUND INVOICE (Called by DeFi Investor)
;; Investor provides upfront liquidity to the Builder.
(define-public (fund-invoice (escrow-id uint) (fund-amount uint))
  (let 
    (
      (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) err-escrow-not-found))
      (locked-amount (get amount-locked escrow))
      (discount (get discount-bps escrow))
      
      ;; Calculate how much funding is required to fully fund the discounted invoice
      ;; e.g. 10000 locked, 10% discount (1000 bps) -> 9000 required
      (required-funding (- locked-amount (/ (* locked-amount discount) u10000)))
      (current-funded (get total-funded escrow))
      (new-total-funded (+ current-funded fund-amount))
    )
    ;; Must be TOKENIZED
    (asserts! (is-eq (get status escrow) STATUS_TOKENIZED) err-invalid-status)
    ;; Cannot overfund
    (asserts! (<= new-total-funded required-funding) err-already-funded)
    
    ;; Transfer funds directly from Investor to Builder (simulating sBTC instant liquidity)
    (try! (stx-transfer? fund-amount tx-sender (get builder escrow)))
    
    ;; Calculate the Investor's share of the final payout
    ;; share-bps = (fund-amount / required-funding) * 10000
    (let 
      (
        (share-bps (/ (* fund-amount u10000) required-funding))
      )
      
      ;; Record Investor's share
      (map-set investors 
        { escrow-id: escrow-id, investor: tx-sender }
        { share-bps: share-bps, amount-invested: fund-amount }
      )
      
      ;; Update total funded
      (ok (map-set escrows 
        { escrow-id: escrow-id }
        (merge escrow { total-funded: new-total-funded })
      ))
    )
  )
)

;; 4. RESOLVE ESCROW (Called by Oracle/Admin)
;; Triggered when the x402 API verifies the GitHub PR is merged.
(define-public (resolve-escrow (escrow-id uint))
  (let 
    (
      (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) err-escrow-not-found))
    )
    ;; Only the contract owner (acting as Oracle for the hackathon) can resolve
    (asserts! (is-eq tx-sender contract-owner) err-not-authorized)
    ;; Must not be settled already
    (asserts! (not (is-eq (get status escrow) STATUS_SETTLED)) err-invalid-status)
    
    ;; Update status to SETTLED so investors can claim
    (ok (map-set escrows 
      { escrow-id: escrow-id }
      (merge escrow { status: STATUS_SETTLED })
    ))
  )
)

;; 5. CLAIM YIELD (Called by Investor)
;; Investor claims their share of the locked payout.
(define-public (claim-yield (escrow-id uint))
  (let 
    (
      (escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) err-escrow-not-found))
      (investment (unwrap! (map-get? investors { escrow-id: escrow-id, investor: tx-sender }) err-nothing-to-claim))
      (locked-amount (get amount-locked escrow))
      (share (get share-bps investment))
      
      ;; Calculate payout: (locked-amount * share-bps) / 10000
      (payout-amount (/ (* locked-amount share) u10000))
    )
    ;; Must be SETTLED
    (asserts! (is-eq (get status escrow) STATUS_SETTLED) err-invalid-status)
    ;; Must have a share > 0
    (asserts! (> share u0) err-nothing-to-claim)
    
    ;; Transfer the payout from the contract to the Investor
    ;; Capture investor principal before as-contract (where tx-sender changes to contract)
    (let ((investor-principal tx-sender))
      (try! (as-contract (stx-transfer? payout-amount tx-sender investor-principal)))
    )
    
    ;; Zero out the share to prevent double claiming
    (ok (map-set investors 
      { escrow-id: escrow-id, investor: tx-sender }
      (merge investment { share-bps: u0 })
    ))
  )
)

;; ---------------------------------------------------------
;; Read-Only Functions
;; ---------------------------------------------------------

(define-read-only (get-escrow (escrow-id uint))
  (map-get? escrows { escrow-id: escrow-id })
)

(define-read-only (get-investment (escrow-id uint) (investor principal))
  (map-get? investors { escrow-id: escrow-id, investor: investor })
)
