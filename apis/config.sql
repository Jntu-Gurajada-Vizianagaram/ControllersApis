create database if not exists jntugv;
use jntugv;
show tables;
desc admins;
-- drop table admins;-- 
insert into admins values(0,'Dannana Sai Ajith Kumar','dsak.official@gmail.com','1437890','developer');
insert into admins values(0,'Main Admin','admin','pwd@admin','controller');
select * from admins;
select name from admins where username='admin' and password='pwd@admin' and role='controller';
select name from admins where username='dsak.official@gmail.com' and password='1437890' and role='developer';
delete from admins where id=1;
-- drop database jntugv;-- 
DELETE FROM event_photos
WHERE id BETWEEN 1 AND 6;
