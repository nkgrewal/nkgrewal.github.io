<?php 

include '../../includes/asd_defaults.php';

header("Content-type: text/xml"); 

$arr = array( 0 );

// tripped allows us to have a smart opening + closing of <school> tags
$tripped = false;
	
$linkID = mysql_connect($host, $user, $pass) or die("Could not connect to host."); 
mysql_select_db($database, $linkID) or die("Could not find database."); 

$query = "SELECT * FROM asd_tbl ORDER BY schoolID DESC"; 
$resultID = mysql_query($query, $linkID) or die("Data not found."); 

$xml_output = "<?xml version=\"1.0\"?>\n"; 
$xml_output .= "<schools>\n"; 

for($x = 0 ; $x < mysql_num_rows($resultID) ; $x++){ 
    $row = mysql_fetch_assoc($resultID); 
	
	// if the school has been found, make this true
	$found = false;
	
	// check to see if it's been added to the array yet, add a school tag, or just add a focus
	for ( $i = 0; $i < count( $arr ); $i++ ) {
		if ( $arr[ $i ] == $row[ 'schoolID' ] ) {
			$found = true;
		}
	}
	
	// if not found, make a new school parent
	if ( !$found ) {
		if ( $tripped ) {
			$xml_output .= "\t</school>\n";
		}
		
		$st = strtolower( $row[ 'state' ] );
		
		switch( $st )
		{
			case "in" :
				$st = "ind";
				break;
			case "or" :
				$st = "ore";
				break;
			case "ne" :
				$st = "neb";
				break;
			case "fl" :
				$st = "flo";
				break;
				
		}
		
		$xml_output .= "\t<school id=\"" .  $row[ 'schoolID' ] . "\" name=\"" . escape( $row[ 'institution' ] ) . "\" state=\"" . $st . "\" campus=\"" . $row[ 'campus' ] . "\" logo=\"" . $row[ 'logo' ] . "\">\n";
		array_push( $arr, $row[ 'schoolID' ] );
		$tripped = true; 
	}
    $xml_output .= "\t\t<focus>" . $row['focusID'] . "</focus>\n"; 
} 

$xml_output .= "\t</school>\n"; 

$xml_output .= "</schools>"; 

echo $xml_output; 


function escape( $str ) {
	// Escaping illegal characters 
	$str = str_replace("&", "&amp;", $str); 
	$str = str_replace("<", "&lt;", $str); 
	$str = str_replace(">", "&gt;", $str); 
	$str = str_replace("\"", "&quot;", $str); 
	
	return $str;
}

?>