# Do not change the order or names of states 
#(the code is assuming specific IDs and names)
# You can add more in the end
insert into game_state (gst_state) values ('Waiting');
insert into game_state (gst_state) values ('Started');
insert into game_state (gst_state) values ('Finished');
insert into game_state (gst_state) values ('Canceled');

# Do not change the order, but you can add more in the end
insert into user_game_state (ugst_state) values ('Waiting');
insert into user_game_state (ugst_state) values ('Playing');
insert into user_game_state (ugst_state) values ('End');

# ----------- NEW --------------

insert into ship_state (shs_state) values ('Ready');
insert into ship_state (shs_state) values ('Acted');
insert into ship_state (shs_state) values ('Defensive');

insert into card_type (ct_name) values ('Attack'),('Heal'),('Defense');


insert into card (crd_cost,crd_name, crd_effect,crd_note,crd_type_id) values 
   (2,"Full Salvo","Does 3 damage",null,1),
   (1,"Aimed Shot","Does 1 damage","If HP is lower than 10 does 2 damage instead.",1),
   (2,"Barrage","Does 2 damage","Does damage even to ships with defensive maneuvers",1),
   (1,"Weak Spot Attack","Does 1 damage","Add 1 damage more for each attack made this turn",1),
   (2,"Repair","Recovers 2 HP of your ship",null,2),
   (3,"Last Hope","Recover 4 HP or up 10 HP, whatever is greater","Deplets all action points. Must be played as the only card of the turn.",2),
   (2,"Defensive Maneuvers","All normal attacks fail until your next turn","Must be played as the only card of the turn.",3);

INSERT INTO user VALUES (1,'me','$2b$10$Wemfac2wY/7RSCdKxuYUL.GV2clfhXC66OL76uCpDFUmpYZ/bGZtW','48MnTVJ6sKIvanVHbP5Vx5rysbYrVN4EbYmk4D8xESdfm1hx8jDfNFZGNw9OZs'),(2,'me2','$2b$10$6j2xIDnnxv.TLfBSstbbO.qE7wFTf5envx/uijiFjCP3slsy7EE4K','dQ7NrsbPsuF81xFGNioR1K0tiYkjtxOhemcgMhuFIS68VrFUC9gggm3JCgzkqe');
INSERT INTO game VALUES (1,1,2);
INSERT INTO user_game VALUES (1,1,1,2),(2,2,1,1);

INSERT INTO ship VALUES (1,1,1,20,3),(2,2,1,20,0);

INSERT INTO user_game_card VALUES (1,1,CEIL(RAND()*7),1),(2,1,CEIL(RAND()*7),1),(3,1,CEIL(RAND()*7),1);
