use `OSI_1.01`;
alter table user
add column user_type tinyint(1) after name;
alter table route
add column tickets_sold int after active;