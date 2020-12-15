namespace training.listreport.entities;

entity SelloutHeader {
  key id: Integer not null;
  name: String(30) not null;
  description: String(255);
  createdBy: String(60) not null;
  createdAt: Integer64 not null;
  daysCEDI: Integer not null;
  daysPOS: Integer not null;
  stdCal: Integer not null;
  items: Association to many SelloutItem on items.header = $self;
}

entity SelloutItem {
  key header: Association to SelloutHeader;
  key day: Integer not null;
  value: Double not null;
}