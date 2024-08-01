create database comprehensive;
use comprehensive;
create table faculty(fuser varchar(20),fpass varchar(20));
insert into faculty values('LBS21IT','it21');
select * from faculty;
create table qstn_bank(qstn_id int  NOT NULL AUTO_INCREMENT PRIMARY KEY , qstn varchar(200)  , 
op1 varchar(200) , op2 varchar(200) , op3 varchar(200) , op4 varchar(200) ,
 crct_ans varchar(200), CONSTRAINT fk_faculty_id_new FOREIGN KEY (faculty_id)
    REFERENCES faculty (faculty_id) );
 drop table qstn_bank;
 select * from qstn_bank;
 drop table qstn_bank;
 create table course_create(facultyname varchar(200) DEFAULT NULL ,
 coursename varchar(200) DEFAULT NULL,
 department varchar(200) DEFAULT NULL , faculty_id int NOT NULL , 
  KEY fk_faculty_id_new (faculty_id), CONSTRAINT fk_faculty_id_new FOREIGN KEY (faculty_id)
    REFERENCES faculty (faculty_id),
     ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci)
    

drop table course_create;
 select * from course_create;
 
 CREATE TABLE faculty
 (  fuser varchar(20) DEFAULT NULL, 
 fpass varchar(20) DEFAULT NULL,  faculty_id int NOT NULL,
 PRIMARY KEY (faculty_id))
 drop table faculty;
 insert into faculty values('Anver','anver',1),('Seetha','seetha',2);