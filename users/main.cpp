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

crow::json::wvalue register_user(const std::string username, const std::string password_p,const std::string name,const std::string user_type)
{
	try
	{
		sql::Driver* driver;
		sql::Connection* con;
		sql::PreparedStatement* stmt;
		sql::ResultSet* res;
		crow::json::wvalue result;

		driver = get_driver_instance();
		con = driver->connect(getenv("DB_HOST"), getenv("DB_USER"), getenv("DB_PASSWORD"));
		std::cout<<"Connected"<<std::endl;
		con->setSchema(getenv("DB_NAME"));

		stmt = con->prepareStatement("SELECT * FROM user WHERE user.username=?");
		stmt->setString(1, username);
		res=stmt->executeQuery();
		res->beforeFirst();
		if(res->next())
		{
		std::string message="Error: Username already exists";
		result["Message"]=message;
		}
		else 
		{   
		std::string password= sha256(password_p);
		res->afterLast();
		stmt = con->prepareStatement("INSERT INTO user(username,password,name,deleted,user_type) VALUES(?,?,?,?,?)");
		stmt->setString(1, username);
		stmt->setString(2, password);
		stmt->setString(3, name);
		stmt->setInt(4, 0);
		if(user_type=="Admin")
		{
		    stmt->setInt(5, 0);
		}
		else if (user_type=="Driver")
		{
			stmt->setInt(5, 1);
		}
		else
		{
			stmt->setInt(5, 2);
		}
		res=stmt->executeQuery();
		stmt = con->prepareStatement("SELECT * FROM user WHERE user.username=?");
		stmt->setString(1, username);
        res=stmt->executeQuery();
		res->next();
		int iduser=res->getInt("iduser");
		if (user_type=="Driver")
		{
		stmt = con->prepareStatement("INSERT INTO driver(iduser,suspended) VALUES(?,?)");
		stmt->setInt(1, iduser);
		stmt->setInt(2, 0);
		res=stmt->executeQuery();
		}
		else if (user_type=="Passenger")
		{
		stmt = con->prepareStatement("INSERT INTO passenger(iduser,suspended) VALUES(?,?)");
		stmt->setInt(1, iduser);
		stmt->setInt(2, 0);
		res=stmt->executeQuery();
		}
		std::string message="Status: true";
		result["Message"]=message;
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

crow::json::wvalue edit_profile(const std::string username,const std::string new_name)
{
	try
	{
		sql::Driver* driver;
		sql::Connection* con;
		sql::PreparedStatement* stmt;
		sql::ResultSet* res;
		crow::json::wvalue result;

		driver = get_driver_instance();
		con = driver->connect(getenv("DB_HOST"), getenv("DB_USER"), getenv("DB_PASSWORD"));
		std::cout<<"Connected"<<std::endl;
		con->setSchema(getenv("DB_NAME"));

        stmt = con->prepareStatement("UPDATE user SET name=? WHERE user.username=?");
		stmt->setString(1, new_name);
		stmt->setString(2, username);
		res=stmt->executeQuery();
		std::string message="Name changed";
		result["Message"]=message;
		
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

crow::json::wvalue suspension(const std::string username)
{
	try
	{
		sql::Driver* driver;
		sql::Connection* con;
		sql::PreparedStatement* stmt;
		sql::ResultSet* res;
		crow::json::wvalue result;

		driver = get_driver_instance();
		con = driver->connect(getenv("DB_HOST"), getenv("DB_USER"), getenv("DB_PASSWORD"));
		std::cout<<"Connected"<<std::endl;
		con->setSchema(getenv("DB_NAME"));

		stmt = con->prepareStatement("SELECT * FROM user WHERE user.username=?");
		stmt->setString(1, username);
		res=stmt->executeQuery();
		res->next();
		int iduser=res->getInt("iduser");
		if(res->getInt("user_type")==2)
		{
		stmt = con->prepareStatement("UPDATE passenger SET suspended=? WHERE passenger.iduser=?");
		stmt->setInt(1,1);
		stmt->setInt(2,iduser);
		res=stmt->executeQuery();
		std::string message="Account suspended";
		result["Message"]=message;
		}
		else if (res->getInt("user_type")==1)
		{
		stmt = con->prepareStatement("UPDATE driver SET suspended=? WHERE driver.iduser=?");
		stmt->setInt(1,1);
		stmt->setInt(2,iduser);
		res=stmt->executeQuery();
	    std::string message="Account suspended";
		result["Message"]=message;
		}
		else
		{
		std::string message="Unable to suspend account";
		result["Message"]=message;	
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
crow::json::wvalue activation(const std::string username)
{
	try
	{
		sql::Driver* driver;
		sql::Connection* con;
		sql::PreparedStatement* stmt;
		sql::ResultSet* res;
		crow::json::wvalue result;

		driver = get_driver_instance();
		con = driver->connect(getenv("DB_HOST"), getenv("DB_USER"), getenv("DB_PASSWORD"));
		std::cout<<"Connected"<<std::endl;
		con->setSchema(getenv("DB_NAME"));

		stmt = con->prepareStatement("SELECT * FROM user WHERE user.username=?");
		stmt->setString(1, username);
		res=stmt->executeQuery();
		res->next();
		int iduser=res->getInt("iduser");
		if(res->getInt("user_type")==2)
		{
		stmt = con->prepareStatement("UPDATE passenger SET suspended=? WHERE passenger.iduser=?");
		stmt->setInt(1,0);
		stmt->setInt(2,iduser);
		res=stmt->executeQuery();
		std::string message="Account activated";
		result["Message"]=message;
		}
		else if (res->getInt("user_type")==1)
		{
		stmt = con->prepareStatement("UPDATE driver SET suspended=? WHERE driver.iduser=?");
		stmt->setInt(1,0);
		stmt->setInt(2,iduser);
		res=stmt->executeQuery();
	    std::string message="Account activated";
		result["Message"]=message;
		}
		else
		{
		std::string message="Unable to activate account.";
		result["Message"]=message;	
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

crow::json::wvalue delete_user(const std::string username)
{
	try
	{
		sql::Driver* driver;
		sql::Connection* con;
		sql::PreparedStatement* stmt;
		sql::ResultSet* res;
		crow::json::wvalue result;

		driver = get_driver_instance();
		con = driver->connect(getenv("DB_HOST"), getenv("DB_USER"), getenv("DB_PASSWORD"));
		std::cout<<"Connected"<<std::endl;
		con->setSchema(getenv("DB_NAME"));

		stmt = con->prepareStatement("SELECT * FROM user WHERE user.username=?");
		stmt->setString(1, username);
		res=stmt->executeQuery();
		res->next();
		if (res->getInt("user_type")==1)
		{
		std::string message="Account can not be deleted";
		result["Message"]=message;
		}
		else
		{
		stmt = con->prepareStatement("UPDATE user SET deleted=? WHERE user.username=?");
		stmt->setInt(1,1);
		stmt->setString(2,username);
		res=stmt->executeQuery();
		std::string message="Account deleted";
		result["Message"]=message;	
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
crow::json::wvalue password_change(const std::string username,const std::string new_password, const std::string old_password)
{
	try
	{
		sql::Driver* driver;
		sql::Connection* con;
		sql::PreparedStatement* stmt;
		sql::ResultSet* res;
		crow::json::wvalue result;

		driver = get_driver_instance();
		con = driver->connect(getenv("DB_HOST"), getenv("DB_USER"), getenv("DB_PASSWORD"));
		std::cout<<"Connected"<<std::endl;
		con->setSchema(getenv("DB_NAME"));

        std::string message;
        if(old_password != new_password){
            std::string protected_password = sha256(new_password);
            stmt = con->prepareStatement("UPDATE user SET password=? WHERE user.username=?");
		    stmt->setString(1, protected_password);
		    stmt->setString(2, username);
		    res=stmt->executeQuery();
		    message="Password changed";
		    result["Message"]=message;
        }
        else{
            message="New password and old password are the same!";
            result["Message"]=message;
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
		CROW_ROUTE(app, "/register")([](const crow::request& req)
		{
			std::string body = req.body;
			std::cout<<body<<std::endl;
			std::string first = body.substr(body.find("\n")+1, body.find(";"));
			const std::string username = req.get_header_value("username");
			const std::string password = req.get_header_value("password");
			const std::string name = req.get_header_value("name");
			const std::string user_type=req.get_header_value("user_type");
			crow::json::wvalue result = register_user(username, password,name,user_type);
			return result;
		});
		CROW_ROUTE(app, "/edit_profile")([](const crow::request& req)
		{
			std::string body = req.body;
			std::cout<<body<<std::endl;
			std::string first = body.substr(body.find("\n")+1, body.find(";"));
			const std::string username = req.get_header_value("username");
			const std::string name = req.get_header_value("name");
			crow::json::wvalue result = edit_profile(username,name);
			return result;
		});
		CROW_ROUTE(app, "/suspension")([](const crow::request& req)
		{
			std::string body = req.body;
			std::cout<<body<<std::endl;
			std::string first = body.substr(body.find("\n")+1, body.find(";"));
			const std::string username = req.get_header_value("username");
			crow::json::wvalue result = suspension(username);
			return result;
		});
		CROW_ROUTE(app, "/activation")([](const crow::request& req)
		{
			std::string body = req.body;
			std::cout<<body<<std::endl;
			std::string first = body.substr(body.find("\n")+1, body.find(";"));
			const std::string username = req.get_header_value("username");
			crow::json::wvalue result = activation(username);
			return result;
		});
		CROW_ROUTE(app, "/delete")([](const crow::request& req)
		{
			std::string body = req.body;
			std::cout<<body<<std::endl;
			std::string first = body.substr(body.find("\n")+1, body.find(";"));
			const std::string username = req.get_header_value("username");
			crow::json::wvalue result = delete_user(username);
			return result;
		});

		CROW_ROUTE(app, "/password_change")([](const crow::request& req)
		{
			std::string body = req.body;
			std::cout<<body<<std::endl;
			std::string first = body.substr(body.find("\n")+1, body.find(";"));
			const std::string username = req.get_header_value("username");
			const std::string old_password = req.get_header_value("old_password");
            	const std::string new_password = req.get_header_value("new_password");
			crow::json::wvalue result = password_change(username,new_password,old_password);
			return result;
		});

	std::cout<<"Running on: http://120.0.0.1:3002"<<std::endl;
	app.port(params::port).run();
	return 0;
}

