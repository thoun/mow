<?php
class Card {
    public $id;
    public $location;
    public $location_arg;
    public $type;
    public $number;
    public $slowpokeNumber;

    public function __construct($dbCard) {
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->location_arg = intval($dbCard['location_arg']);
        $this->type = intval($dbCard['type']);
        $this->number = intval($dbCard['type_arg']);
        $this->slowpokeNumber = isset($dbCard['slowpoke_type_arg']) ? intval($dbCard['slowpoke_type_arg']) : null;
    } 
}
?>
