import mysql.connector

class MysqlManager(object):

	def __init__(self):
		self.connection = mysql.connector.connect(user='root', password='password', host='127.0.0.1', database='Fancy_Hotel')
		self.init_db()


	def init_db(self):
		pass

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
					FROM customer 
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
				'''INSERT INTO customer (username, email, password, first_name, last_name)
				VALUES (%(username)s, %(email)s, %(password)s, %(first_name)s, %(last_name)s)''',
				{'username': username, 'email': email, 'password': password, 'first_name': firstName, 'last_name': lastName}
			)
			if cursor.rowcount != 1:
				pass
			else:
				self.connection.commit() #required to write into the database
		finally:
			cursor.close()