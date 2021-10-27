<?php 
    $arr = array( 'home', 'about', 'projects', 'help', 'doc', 'index');
?>


<ul>
<?php 
    foreach ($arr as $value ) {
        echo '<li>'. $value .'</li>';
    } 
?>
</ul>
