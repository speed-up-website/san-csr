$(document).ready(function(){
    $("input").keyup(function() {
   

    /**
     * Users DataService
     * Uses embedded, hard-coded data model; acts asynchronously to simulate
     * remote data service call(s).
     *
     * @returns {{loadAll: Function}}
     * @constructor
     */
    

        //function make_any(certf, context) {
            //var deferred = $q.defer();
			
			//JS string to array
			//var string_filtered = certf.hostname.replace(" ", ""); //using angular JS
			
			//var string_val = $("input#hostname").value;
			var string_val = document.getElementById("hostname").value;
			
			//alert(string_val);
			
			var string_filtered = string_val.replace(" ", "");
			var domains_array = string_filtered.split(",");
			//alert(domains_array.length);
			
			//SAN - Subject Alternative Name
			var san = "";
			var i;
			for (i = 0; i < domains_array.length; i++) {
								
				if(i==0){
					san = domains_array[i]+", ";
				}
				else{
					if(i < (domains_array.length - 1)){
						san = san + "DNS:" + domains_array[i]+", ";
					}
					else{
						san = san + "DNS:" + domains_array[i];
					}
				}
			}
			
			alert(san);
			

            // #region Get a "crypto" extension
            var crypto = org.pkijs.getCrypto();
            if (typeof crypto == "undefined") {
                $scope.bWebcrypto = false;
                context.content = '';
                $timeout(function() {
                    deferred.reject('No WebCrypto extension found');
                }, 0);
                return deferred.promise;
            }
            // #endregion

            // #region Prepare P10
            context = context || {};
            var sequence = Promise.resolve();
            var pkcs10_simpl = new org.pkijs.simpl.PKCS10();
            var publicKey;
            var privateKey;
            var hash_algorithm;
            hash_algorithm = "sha-256";

            var signature_algorithm_name, keylength;
            switch (certf.algorithm) {
                case "RSA":
                    signature_algorithm_name = "RSASSA-PKCS1-V1_5";
                    keylength = parseInt(certf.keysize);
                    break;
                case "ECC":
                    signature_algorithm_name = "ECDSA";
                    switch (certf.keysize) {
                        case 'secp256r1':
                            keylength = "P-256";
                            break;
                        case 'secp384r1':
                            keylength = "P-384";
                            break;
                        case 'secp521r1':
                            keylength = "P-521";
                            break;
                    }
                    break;
                default:
                    ;
            }
            // #endregion

            // #region Put a static values
            pkcs10_simpl.version = 0;

            if (certf.country)
                pkcs10_simpl.subject.types_and_values.push(new org.pkijs.simpl.ATTR_TYPE_AND_VALUE({
                    type: "2.5.4.6",
                    value: new org.pkijs.asn1.PRINTABLESTRING({
                        value: certf.country
                    })
                }));

            if (certf.state)
                pkcs10_simpl.subject.types_and_values.push(new org.pkijs.simpl.ATTR_TYPE_AND_VALUE({
                    type: "2.5.4.8",
                    value: new org.pkijs.asn1.UTF8STRING({
                        value: certf.state
                    })
                }));

            if (certf.city)
                pkcs10_simpl.subject.types_and_values.push(new org.pkijs.simpl.ATTR_TYPE_AND_VALUE({
                    type: "2.5.4.7",
                    value: new org.pkijs.asn1.UTF8STRING({
                        value: certf.city
                    })
                }));

            if (certf.organization)
                pkcs10_simpl.subject.types_and_values.push(new org.pkijs.simpl.ATTR_TYPE_AND_VALUE({
                    type: "2.5.4.11",
                    value: new org.pkijs.asn1.UTF8STRING({
                        value: certf.organization
                    })
                }));

            if (certf.organization_unit)
                pkcs10_simpl.subject.types_and_values.push(new org.pkijs.simpl.ATTR_TYPE_AND_VALUE({
                    type: "2.5.4.10",
                    value: new org.pkijs.asn1.UTF8STRING({
                        value: certf.organization_unit
                    })
                }));

            pkcs10_simpl.subject.types_and_values.push(new org.pkijs.simpl.ATTR_TYPE_AND_VALUE({
                type: "2.5.4.3",
                value: new org.pkijs.asn1.UTF8STRING({
                    value: domains_array[0]
                })
            }));

            pkcs10_simpl.attributes = [];
            // #endregion

            // #region Create a new key pair
            sequence = sequence.then(function() {
                // Set hash algorithm
                var algorithm = org.pkijs.getAlgorithmParameters(signature_algorithm_name, "generatekey");
                if ("hash" in algorithm.algorithm)
                    algorithm.algorithm.hash.name = hash_algorithm;
                // #endregion

                // Set key length
                switch (certf.algorithm) {
                    case "RSA":
                        algorithm.algorithm.modulusLength = keylength;
                        break;
                    case "ECC":
                        algorithm.algorithm.namedCurve = keylength;
                        break;
                }

                return crypto.generateKey(algorithm.algorithm, true, algorithm.usages);
            });
            // #endregion

            // #region Store new key in an interim variables
            sequence = sequence.then(function(keyPair) {
                publicKey = keyPair.publicKey;
                privateKey = keyPair.privateKey;
            }, function(error) {
                context.content = '';
                //alert("Error during key generation: " + error);
                deferred.reject("Error during key generation: " + error);
            });
            // #endregion

            // #region Exporting public key into "subjectPublicKeyInfo" value of PKCS#10
            sequence = sequence.then(function() {
                return pkcs10_simpl.subjectPublicKeyInfo.importKey(publicKey);
            });
            // #endregion

            // #region SubjectKeyIdentifier
            sequence = sequence.then(function(result) {
                return crypto.digest({
                    name: "SHA-1"
                }, pkcs10_simpl.subjectPublicKeyInfo.subjectPublicKey.value_block.value_hex);
            }).then(function(result) {
				
				var extensions = new org.pkijs.simpl.EXTENSIONS({
                            extensions_array: [
                                new org.pkijs.simpl.EXTENSION({
                                    extnID: "2.5.29.14",
                                    critical: false,
                                    extnValue: (new org.pkijs.asn1.OCTETSTRING({ value_hex: result })).toBER(false)
                                })
                            ]
                        });
						
				var altNames = new org.pkijs.simpl.GENERAL_NAMES({
						 names: [
								  new org.pkijs.simpl.GENERAL_NAME({
										   NameType: 2,
										   Name: san
										   })
								  ]
				});

				 extensions.extensions_array.push(new org.pkijs.simpl.EXTENSION({
						 extnID: "2.5.29.17", // subjectAltName
						 critical: false,
						 extnValue: altNames.toSchema().toBER(false)
					 }));
				

				 var attribute = new org.pkijs.simpl.ATTRIBUTE({
					 type: "1.2.840.113549.1.9.14", // pkcs-9-at-extensionRequest
					 values: [extensions.toSchema()]
				});

				pkcs10_simpl.attributes.push(attribute);
				
								
				
				/*
                pkcs10_simpl.attributes.push(new org.pkijs.simpl.ATTRIBUTE({
                    type: "1.2.840.113549.1.9.14", // pkcs-9-at-extensionRequest
                    values: [(new org.pkijs.simpl.EXTENSIONS({
                        extensions_array: [
                            new org.pkijs.simpl.EXTENSION({
                                extnID: "2.5.29.14",
                                critical: false,
                                extnValue: (new org.pkijs.asn1.OCTETSTRING({
                                    value_hex: result
                                })).toBER(false)
                            })
                        ]
                    })).toSchema()]
                }));
				*/
            });
            // #endregion

            // #region Signing final PKCS#10 request
            sequence = sequence.then(function() {
                context.privateKey = pkcs10_simpl.sign(privateKey, hash_algorithm);
                return pkcs10_simpl.sign(privateKey, hash_algorithm);
            }, function(error) {
                context.content = '';
                //alert("Error during exporting public key: " + error);
                deferred.reject("Error during exporting public key: " + error);
            });
            // #endregion

            sequence.then(function(result) {
                var pkcs10_schema = pkcs10_simpl.toSchema();
                var pkcs10_encoded = pkcs10_schema.toBER(false);

                var result_string = "-----BEGIN CERTIFICATE REQUEST-----\r\n";
                result_string = result_string + formatPEM(window.btoa(arrayBufferToString(pkcs10_encoded)));
                result_string = result_string + "\r\n-----END CERTIFICATE REQUEST-----\r\n";
                context.content = result_string;
				
				//$("result-custom").html(result_string);
				
								
				
				//Display the private key download link 
				$("#download-pkey").show();
				
//Reset the link and text area upon domain text value change and/or select option value change
				
				//Write the CSR text
				//.value only works with text area - and this is sufficient in this case.   But .innerHTML with both div and text area
				
				//document.getElementById("pem-text-block").value = result_string;
				
				$("#pem-text-block").html(result_string);
				
				$("#pem-text-block").prop('disabled', true);
				
				//Convert comma separated domains to array
			
				//CN = array[0]
			
				//compute SAN from the array
				
				//Write the CSR text to the respective div
                $($("md-list-item")[0]).find("pre").html(result_string);
                $("md-progress-linear").hide();
				
                
            }, function(error) {
                context.content = '';
                //alert("Error signing PKCS#10: " + error);
                deferred.reject("Error signing PKCS#10: " + error);
            });
            // #region Exporting pri'vate key
            sequence = sequence.then(function() {
                return crypto.exportKey("pkcs8", privateKey);
            });
            // #endregion
            sequence.then(function(result) {
                var private_key_string = String.fromCharCode.apply(null, new Uint8Array(result));
                var result_string = "-----BEGIN PRIVATE KEY-----\r\n";
                result_string = result_string + formatPEM(window.btoa(private_key_string));
                result_string = result_string + "\r\n-----END PRIVATE KEY-----";
                context.privateKey = result_string;
                deferred.resolve(context.content);
				
				// Start file download.
				document.getElementById("pkey").addEventListener("click", function(){
					// Generate download of hello.txt file with some content
					var text = result_string;					
					var filename = domains_array[0].replace("*", "star") + ".key";
					
					download(filename, text);
				}, false);
				
				
            }, function(error) {
                //alert("Error during exporting of private key: " + error);
                context.content = '';
                deferred.reject("Error during exporting of private key: " + error);
                context.support = false;
            });

            return deferred.promise;
        //}
		
		function download(filename, text) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:application/pkcs8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
		}

        function formatPEM(pem_string) {
            var string_length = pem_string.length;
            var result_string = "";

            for (var i = 0, count = 0; i < string_length; i++, count++) {
                if (count > 63) {
                    result_string = result_string + "\r\n";
                    count = 0;
                }

                result_string = result_string + pem_string[i];
            }

            return result_string;
        }

        function arrayBufferToString(buffer) {
            /// <summary>Create a string from ArrayBuffer</summary>
            /// <param name="buffer" type="ArrayBuffer">ArrayBuffer to create a string from</param>

            var result_string = "";
            var view = new Uint8Array(buffer);

            for (var i = 0; i < view.length; i++) {
                result_string = result_string + String.fromCharCode(view[i]);
            }

            return result_string;
        }

        function stringToArrayBuffer(str) {
            /// <summary>Create an ArrayBuffer from string</summary>
            /// <param name="str" type="String">String to create ArrayBuffer from</param>

            var stringLength = str.length;

            var resultBuffer = new ArrayBuffer(stringLength);
            var resultView = new Uint8Array(resultBuffer);

            for (var i = 0; i < stringLength; i++)
                resultView[i] = str.charCodeAt(i);

            return resultBuffer;
        }

        function getFilename(str) {
            if (!str) return '';
            var temp1 = str.replace("/", "_");
            var temp2 = temp1.replace("\\", "_");
            var temp3 = temp2.replace(":", "_");
            var temp4 = temp3.replace("?", "_");
            var temp5 = temp4.replace("<", "_");
            var temp6 = temp5.replace(">", "_");
            var temp7 = temp6.replace("|", "_").replace("*", "star");

            return temp7;
        }

        function getECCKeysize(type, keysize) {
            switch (type) {
                case 'iis':
                    switch (keysize) {
                        case 'secp256r1':
                            return "ECDH_P256";
                        case 'secp384r1':
                            return "ECDH_P384";
                        case 'secp521r1':
                            return "ECDH_P521";
                    }
                    return;
                case 'keytool':
                    switch (keysize) {
                        case 'secp256r1':
                            return "256";
                        case 'secp384r1':
                            return "384";
                        case 'secp521r1':
                            return "521";
                    }
                    return;
                case 'bigip':
                    switch (keysize) {
                        case 'secp256r1':
                            return "prime256v1";
                        case 'secp384r1':
                            return "secp384r1";
                    }
                    return;
            }
        }

    
	})
});
