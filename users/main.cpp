#include <cstdlib>
#include <iostream>
#include "crow.h"
#include "mysql_connection.h"
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>
#include <cppconn/prepared_statement.h>


#include "params.h"
#include "sha256.h"
#include "jwt/jwt.hpp"
#include "string"

crow::json::wvalue list_users()
{
	try
	{
		sql::Driver* driver;
		sql::Connection* con;
		sql::Statement* stmt;
		sql::ResultSet* res;
		crow::json::wvalue result;

		driver = get_driver_instance();
		con = driver->connect(getenv("DB_HOST"), getenv("DB_USER"), getenv("DB_PASSWORD"));
		std::cout<<"Connected"<<std::endl;
		con->setSchema(getenv("DB_NAME"));

		stmt = con->createStatement();
		res = stmt->executeQuery("SELECT * FROM user");
		while (res->next()) {
			crow::json::wvalue::object tmp;
			tmp["username"] = res->getString("username");
			tmp["deleted"] = res->getInt("deleted")?"True":"False";
			tmp["name"] = res->getString("name");
			
			result[res->getString("iduser")] = tmp;
		}

		delete res;
		delete stmt;
		delete con;
		return result;

	}
	catch (sql::SQLException& e)										
	{																					
		std::cout << "# ERR: SQLException in " << __FILE__;								
		std::cout << "(" << __FUNCTION__ << ") on line " << __LINE__ << std::endl;		
		std::cout << "# ERR: " << e.what();												
		std::cout << " (MySQL error code: " << e.getErrorCode();						
		std::cout << ", SQLState: " << e.getSQLState() << " )" << std::endl;			
		crow::json::wvalue ret;															
		ret["ERROR:"] = e.what();															
		return  ret;																
	}		
}

crow::json::wvalue login_user(const std::string username, const std::string password)
{
	try
	{
		// SQL Boiler plate - ovo copy paste

		sql::Driver* driver;
		sql::Connection* con;
		// Razlika od onog list, PreparedStatement su sigurnije
		sql::PreparedStatement* stmt;
		sql::ResultSet* res;
		crow::json::wvalue result;

		driver = get_driver_instance();
		con = driver->connect(getenv("DB_HOST"), getenv("DB_USER"), getenv("DB_PASSWORD"));
		std::cout<<"Connected"<<std::endl;
		con->setSchema(getenv("DB_NAME"));

		// Dalje ide logika koda


		// Koristiti PreparedStatement, kada trebate ubaciti neki parametar za pretragu stavite ? 
		stmt = con->prepareStatement("SELECT * FROM user where username =  ?");
		// Ovim setujete vrijednost parametra, prvi argument je redni broj upitnika drugi je vrijednost, paziti na tip podatka
		// Kroz MySQL workbench kada se prijavite na bazu mozete vidjeti tip podatka, VARCHAR = string
		stmt->setString(1, username);
		// Kao za list samo drugacija komanda
		res = stmt->executeQuery();
		while (res->next()) {
			// Stavljate u result objekat
			result["username"] = res->getString("username");
			result["name"] = res->getString("name");
			// sha256 prima referencu na password pa castujem const referencu u obicnu, ne znam da li ovo treba ali za svaki slucaj
			std::string sPassword = password;
			// Provjer da li se passwordi slazu, u bazi cuvamo passworde hashirane sha256 algoritmom, kada budete radili promjenu 
			// passworda obratite paznju na to da cuvate hashovan
			bool login = (res->getString("password") == sha256(sPassword));
			result["login"] = login;
			
			if(login){
			std::string jwt_key = getenv("JWT_KEY");
			std::string username = res->getString("username");
			// Pogledati dokumentaciju na https://github.com/arun11299/cpp-jwt jer tu biblioteku koristimo
			jwt::jwt_object obj{jwt::params::algorithm("HS256"), jwt::params::payload({{"user", username}}), jwt::params::secret(jwt_key)};
			auto enc_str = obj.signature();
			result["token"] = enc_str;
			}
		}
		// Dalje sve isti boilerplate
		delete res;
		delete stmt;
		delete con;
		return result;

	}
	catch (sql::SQLException& e)										
	{																					
		std::cout << "# ERR: SQLException in " << __FILE__;								
		std::cout << "(" << __FUNCTION__ << ") on line " << __LINE__ << std::endl;		
		std::cout << "# ERR: " << e.what();												
		std::cout << " (MySQL error code: " << e.getErrorCode();						
		std::cout << ", SQLState: " << e.getSQLState() << " )" << std::endl;			
		crow::json::wvalue ret;															
		ret["ERROR:"] = e.what();															
		return  ret;																
	}		
}

int main()
{
	crow::SimpleApp app;
	CROW_ROUTE(app, "/")([]()
		{
			return "Hello world!!";
		});
	CROW_ROUTE(app, "/list")([]()
		{
			crow::json::wvalue res = list_users();
			return list_users();
		});
	CROW_ROUTE(app, "/login")([](const crow::request& req)
		{
			std::string body = req.body;
			std::cout<<body<<std::endl;
			std::string first = body.substr(body.find("\n")+1, body.find(";"));
			const std::string username = req.get_header_value("username");
			const std::string password = req.get_header_value("password");
			crow::json::wvalue result = login_user(username, password);
			return result;
		});
	std::cout<<"Running on: http://120.0.0.1:3002"<<std::endl;
	app.port(params::port).run();
	return 0;
}

