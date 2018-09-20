# SAN CSR
SAN CSR is an app to generate SSL Certificate Signing Request (CSR) in seconds using a web browser. All you need to do is to open the index.html file in your favorite browser, enter the domains (separated by comma) in the first field and scroll down! You may fill in other fields of course. However, that is optional.

This app generates the key pair using the WebCrypto API and web browser. Then it uses <a href="https://pkijs.org/" target="_blank">PKIjs</a> library to generate the SSL Certificate Request (CSR).

The private key, CSR everything is generated locally in your computer and never transmitted over the internet.

Credits go to the <a href="https://github.com/PeculiarVentures/csrhelp" target="_blank">'csrhelp'</a> app. 'csrhelp' is suitable for one domain only. We have done a few modifications to make it compatible with multiple domains so that you can use the CSR for a SAN certificate.

If you are looking for Free SSL certificates, please visit <a href="https://freessl.tech" target="_blank">FreeSSL.tech</a>. The SSL certificates generated and renewed by FreeSSL.tech are always free. FreeSSL.tech uses the ACME V2 API of Let's Encrypt. So, you can get wildcard SSL too, for FREE of cost!
