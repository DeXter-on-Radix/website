# Tracking all ToDo's

- [ ] fetchQuote API + display estimate
- [ ] display calculated fees
- [ ] integrate input validation errors
- [ ] remove order_input folder (old)
- [ ] remove/uninstall react-imask package

## Test before deploy

- [ ] MARKET BUY
- [ ] MARKET SELL
- [ ] LIMIT BUY (specify quantity)
- [ ] LIMIT BUY (specify total)
- [ ] LIMIT SELL (specify quantity)
- [ ] LIMIT SELL (specify total)
- [ ] prevents submitting transaction if POST ONLY is set and transaction can be partially filled
- [ ] Buy order history shows as expected

## All user actions for LIMIT orders

General:

- on limit orders, if no price is set and quantity or total is set, automatically set last price

Specific User Journeys:

- set PRICE
  - set total:
    - if BUY: quantity should be set
    - if SELL: quantity should be set + WARN if not enough
  - set quantity:
    - if BUY: total should be set + WARN if not enough
    - if SELL: total should be set
- once all is set
  - set price:
    - if quantity (token1) was specified -> adapt total (token2)
    - if total (token2) was specified -> adapt quantity (token1)
  - set quantity (token1) -> same as "set PRICE -> set quantity"
  - set total (token2) -> same as "set PRICE -> set total"
