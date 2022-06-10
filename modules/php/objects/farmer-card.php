<?php
class FarmerCard {
    public $id;
    public $location;
    public $location_arg;
    public $type; // id/number
    public $time; // see material.inc.php

    public function __construct($dbCard) {
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->location_arg = intval($dbCard['location_arg']);
        $this->type = intval($dbCard['type']);
        $this->time = intval($dbCard['type_arg']);
    } 
}
?>
