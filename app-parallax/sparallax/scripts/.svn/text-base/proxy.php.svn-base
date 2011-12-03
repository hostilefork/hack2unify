<?php
/*   Copyright 2009 DERI,NUIG

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software   distributed under the License is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and limitations under the License.

*/
// Set your return content type
set_time_limit(10000);
header('Content-type: text/html');
$proxy_url=isset($_GET['proxy_url'])?$_GET['proxy_url']:false;
$callback=isset($_GET['callback'])?$_GET['callback']:false;

if (!$proxy_url) {    
header("HTTP/1.0 400 Bad Request");
echo "proxy.php failed because proxy_url parameter is missing"; 
   exit();
   }
// Website url to open
$daurl =$proxy_url ;

// Get that website's content
//$handle = @fopen($daurl, "r");
$ch = curl_init($proxy_url);


curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_HTTPHEADER, Array("User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.15) Gecko/20080623 Firefox/2.0.0.15") ); // makes our request look like it was made by Firefox
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
$output=curl_exec($ch);
curl_close($ch);


//Load the local XML that was created in the above CURL call
echo $callback."(";
$pos=strpos($output,'Error');
if($pos==false)
echo $output;

	echo ");";
// If there is something, read and return
/*
if ($handle) {

    while (!feof($handle)) {
        $buffer = fgets($handle, 4096);
		
        echo $buffer;
    }
    fclose($handle);

}*/
?>
