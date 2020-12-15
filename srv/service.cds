using training.listreport.entities from '../db/entities';

service Sellout {

  entity headers 
    as projection on entities.SelloutHeader;

  entity items
    as projection on entities.SelloutItem;
}