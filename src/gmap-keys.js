var baseUrl = "${staticCode}";
var keys = {
  "http://mqlx.com/~david/parallax/": "ABQIAAAA5JLLfCE9c7HAtg25QM2KCRTybkRvmvJmmY2jEIjRP5SA6vMolhQSYAaJ2sMVVgF2vj09l_VwCefftw",
  "http://mqlx.com/~david/parallax-staging/": "ABQIAAAA5JLLfCE9c7HAtg25QM2KCRQo1yEfLpCpxhzlEXIU-9s8ddOl3hR54gH6LsXMf1reF1g0Ojb3EfUdgw",
  "http://www.freebase.com/labs/parallax": "ABQIAAAA5JLLfCE9c7HAtg25QM2KCRQH-I06U9yxO16DFpdpFQETIolzohQsaW3nidtAwGU75puMz7livgtakw",
  "http://freebase.com/labs/parallax":  "ABQIAAAA5JLLfCE9c7HAtg25QM2KCRRqZX9Y7otQiALVazghWHDNzxPsiRQeSNtH2jN3Gk3stZroA7F-W0sEBg",
  "http://parallax.dfhuynh.user.dev.freebaseapps.com/": "ABQIAAAA5JLLfCE9c7HAtg25QM2KCRRP4gwngJL8t7jBkZgxKq3FxdaSshQuWFHzPlgS6ohd6yuE4GCOHJpVbQ"
};

var key = "";
for (var n in keys) {
  if (document.location.href.indexOf(n) == 0) {
    key = keys[n];
    break;
  }
}
includeJavascriptFile("http://maps.google.com/maps?file=api&v=2&key=" + key);
