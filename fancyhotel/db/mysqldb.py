import mysql.connector

class MysqlManager(object):

	def __init__(self):
		self.connection = mysql.connector.connect(user='root', password='password', host='127.0.0.1', database='sys')
		self.init_db()


	def init_db(self):
		cursor = self.connection.cursor()
		try:
			#first need to create a db and populate it with tables
			#this way, it can be run on any machine for local development


			cursor.execute(
				'''CREATE DATABASE IF NOT EXISTS Fancy_Hotel2;'''
			)
			
			cursor.execute(
				'''CREATE TABLE IF NOT EXISTS Fancy_Hotel2.Customer (
  					username CHAR(5) NOT NULL,
  					password VARCHAR(16) NOT NULL,
  					first_name VARCHAR(20) NOT NULL,
  					last_name VARCHAR(20) NOT NULL,
  					email VARCHAR(30) NOT NULL,
  					PRIMARY KEY (username),
  					UNIQUE(email)
  				);'''
			)

			cursor.execute(
				'''CREATE TABLE IF NOT EXISTS Fancy_Hotel2.Manager (
  					username char(5) NOT NULL,
  					password varchar(16) NOT NULL,
 					PRIMARY KEY (username)
 				);'''
			)

			cursor.execute(
				'''CREATE TABLE IF NOT EXISTS Fancy_Hotel2.Credit_Card (
				 	card_number char(16) NOT NULL,
				 	name varchar(41) NOT NULL,
				 	cvv char(3) NOT NULL,
				 	expiration_date date NOT NULL,
				 	username char(5) NOT NULL,
				 	PRIMARY KEY (card_number),
				 	FOREIGN KEY (username) REFERENCES Fancy_Hotel2.Customer (username)
				);'''
			)

			cursor.execute(
				'''CREATE TABLE IF NOT EXISTS Fancy_Hotel2.Review (
				 	review_id varchar(20) NOT NULL,
				 	location varchar(9) NOT NULL,
				 	comment varchar(1000) DEFAULT NULL,
				 	rating varchar(10) NOT NULL,
				 	username char(5) NOT NULL,
				 	PRIMARY KEY (review_id),
				 	FOREIGN KEY (username) REFERENCES Fancy_Hotel2.Customer (username)
				);'''
			)


			cursor.execute(
				'''CREATE TABLE IF NOT EXISTS Fancy_Hotel2.Reservation (
				 	reservation_id varchar(20) NOT NULL,
				 	checkin_date date NOT NULL,
				 	checkout_date date NOT NULL,
				 	total_cost float NOT NULL,
				 	username char(5) NOT NULL,
				 	card_number char(16) DEFAULT NULL,
				 	cancelled_or_not char(1) DEFAULT NULL,
				 	PRIMARY KEY (reservation_id),
				 	FOREIGN KEY (username) REFERENCES Fancy_Hotel2.Customer (username),
				 	FOREIGN KEY (card_number) REFERENCES Fancy_Hotel2.Credit_Card (card_number) ON DELETE SET NULL
				);'''
			)

			cursor.execute(
				'''CREATE TABLE IF NOT EXISTS Fancy_Hotel2.Room (
				 	location varchar(9) NOT NULL,
				 	room_number int(11) NOT NULL,
				 	type varchar(20) NOT NULL,
				 	room_cost float NOT NULL,
				 	capacity int(11) NOT NULL,
				 	extra_bed_price float DEFAULT NULL,
				 	PRIMARY KEY (location, room_number)
				);'''
			)


			cursor.execute(
				'''CREATE TABLE IF NOT EXISTS Fancy_Hotel2.Reserves_Extra_Bed (
					location varchar(9) NOT NULL,
					room_number int(11) NOT NULL,
					reservation_id varchar(20) NOT NULL,
					extra_bed_or_not char(1) DEFAULT NULL,
					PRIMARY KEY (location, room_number, reservation_id),
					FOREIGN KEY (location, room_number) REFERENCES Fancy_Hotel2.Room (location, room_number),
					FOREIGN KEY (reservation_id) REFERENCES Fancy_Hotel2.Reservation (reservation_id)
				);'''
			)
			


			#fill db with existing data here: managers, locations, etc


			
		finally:
			cursor.close()
			self.connection.close() #closing the initial sys connection and reconnecting to our new db
			self.connection = mysql.connector.connect(user='root', password='password', host='127.0.0.1', database='Fancy_Hotel2')



	def user_exists(self, username):
		cursor = self.connection.cursor()
		try:
			cursor.execute(
				'''SELECT username 
					FROM customer 
					WHERE username = %(username)s''',
					{'username': username}
			)
			rows = cursor.fetchall() #grabs the rows of our result

			#if user doesn't already exist, there will be no rows, so if rows is 0, then no user exists, and we can create the user
			return len(rows)!=0
		finally:
			cursor.close()


	def email_exists(self, email):
		cursor = self.connection.cursor()
		try:
			cursor.execute(
				'''SELECT email 
					FROM Fancy_Hotel2.Customer 
					WHERE email = %(email)s''',
					{'email': email}
			)

			rows = cursor.fetchall()

			return len(rows)!=0
		finally:
			cursor.close()


	def register_user(self, username, email, password, firstName, lastName):
		cursor = self.connection.cursor()
		try:
			cursor.execute(
				'''INSERT INTO Fancy_Hotel2.Customer (username, email, password, first_name, last_name)
				VALUES (%(username)s, %(email)s, %(password)s, %(first_name)s, %(last_name)s)''',
				{'username': username, 'email': email, 'password': password, 'first_name': firstName, 'last_name': lastName}
			)
			if cursor.rowcount != 1:
				pass
			else:
				self.connection.commit() #required to write into the database
		finally:
			cursor.close()

	def login(self, username, password):
		cursor = self.connection.cursor()
		try:

			userType = username[0];

			
			if userType == 'C':
				cursor.execute(
					'''SELECT *
					FROM Customer
					WHERE username = %(username)s AND password = %(password)s''',
					{'username': username, 'password':password}
				)
				rows = cursor.fetchall()
				return len(rows)!=0

			elif userType == 'M':
				cursor.execute(
					'''SELECT *
					FROM Manager
					WHERE username = %(username)s AND password = %(password)s''',
					{'username': username, 'password':password}
				)
				rows = cursor.fetchall()
				return len(rows)!=0

			else:
				print "you shouldn't be here. Names should only start with C or M."
				return False



		finally:
			cursor.close()