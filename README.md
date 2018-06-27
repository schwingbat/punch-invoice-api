# Punch Invoice API

This module moves the PDF invoice generation out of the main CLI and into its own API which takes a punch summary JSON object and returns a generated PDF file.

The PDF generation is by far the biggest dependency of Punch since it requires an entire copy of Chrome headless to run in the background. The eventual mobile and web apps for punch should also be able to generate the exact same invoices, so the best way to do it is a web API accessible from any device.