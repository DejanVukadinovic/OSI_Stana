#include <cstdlib>
#include <iostream>
#include <boost/algorithm/string.hpp>
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


std::string jwt_return_username(const std::string& token){
	std::string jwt_key = getenv("JWT_KEY");
    auto dec_obj = jwt::decode(token, jwt::params::algorithms({"HS256"}), jwt::params::secret(jwt_key));
    return dec_obj.payload().get_claim_value<std::string>("user");

}

crow::json::wvalue list_users(const std::string authorization)
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
        
		std::string user=jwt_return_username(authorization);
		stmt = con->prepareStatement("SELECT * FROM user where username=  ?");
		stmt->setString(1, user);
		res = stmt->executeQuery();
		res->next();
        if(res->getInt("user_type")==0)
		{
		stmt = con->prepareStatement("SELECT * FROM user");
		res = stmt->executeQuery();
		while (res->next()) {
			crow::json::wvalue::object tmp;
			tmp["username"] = res->getString("username");
			tmp["deleted"] = res->getInt("deleted")?"True":"False";
			tmp["name"] = res->getString("name");
			tmp["user type"]=res->getInt("user_type")?(res->getInt("user_type")==1?"Driver":"Passenger"):"Admin";
			
			result[res->getString("iduser")] = tmp;
		}
		}
		else
		{
			std::string message="Error: User does not have authorization.";
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

crow::json::wvalue list_drivers(const std::string authorization)
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
        
		std::string user=jwt_return_username(authorization);
		stmt = con->prepareStatement("SELECT * FROM user where username=  ?");
		stmt->setString(1, user);
		res = stmt->executeQuery();
		res->next();
        if(res->getInt("user_type")==0)
		{
		stmt = con->prepareStatement("SELECT * FROM user where user_type=  ?");
		stmt->setInt(1, 1);
		res = stmt->executeQuery();
		sql::ResultSet* pom;
		int id;
		while (res->next()) {
			id=res->getInt("iduser");
			stmt = con->prepareStatement("SELECT * FROM driver where iduser= ?");
		    stmt->setInt(1, id);
		    pom = stmt->executeQuery();
			pom->next();
			crow::json::wvalue::object tmp;
			tmp["username"] = res->getString("username");
			tmp["deleted"] = res->getInt("deleted")?"True":"False";
			tmp["suspended"] = pom->getInt("suspended")?"True":"False";
			tmp["name"] = res->getString("name");
			
			
			result[pom->getString("iddriver")] = tmp;
		}
		}
		else
		{
			std::string message="Error: User does not have authorization.";
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

crow::json::wvalue list_passengers(const std::string authorization)
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

		std::string user=jwt_return_username(authorization);
		stmt = con->prepareStatement("SELECT * FROM user where username=  ?");
		stmt->setString(1, user);
		res = stmt->executeQuery();
		res->next();
        if(res->getInt("user_type")==0)
		{
		stmt = con->prepareStatement("SELECT * FROM user where user_type=  ?");
		stmt->setInt(1, 2);
		res = stmt->executeQuery();
		sql::ResultSet* pom;
		int id;
		while (res->next()) {
			id=res->getInt("iduser");
			stmt = con->prepareStatement("SELECT * FROM passenger where iduser= ?");
		    stmt->setInt(1, id);
		    pom = stmt->executeQuery();
			pom->next();
			crow::json::wvalue::object tmp;
			tmp["username"] = res->getString("username");
			tmp["deleted"] = res->getInt("deleted")?"True":"False";
			tmp["suspended"] = pom->getInt("suspended")?"True":"False";
			tmp["name"] = res->getString("name");
			
			
			result[pom->getString("idpassenger")] = tmp;
		}
		}
		else
		{
			std::string message="Error: User does not have authorization.";
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

// crow::json::wvalue driver_details(const std::string username,const std::string authorization)
// {
// 	try
// 	{
// 		sql::Driver* driver;
// 		sql::Connection* con;
// 		sql::PreparedStatement* stmt;
// 		sql::ResultSet* res;
// 		crow::json::wvalue result;

// 		driver = get_driver_instance();
// 		con = driver->connect(getenv("DB_HOST"), getenv("DB_USER"), getenv("DB_PASSWORD"));
// 		std::cout<<"Connected"<<std::endl;
// 		con->setSchema(getenv("DB_NAME"));
        
// 		std::string user=jwt_return_username(authorization);
// 		stmt = con->prepareStatement("SELECT * FROM user WHERE username=  ?");
// 		stmt->setString(1, user);
// 		res = stmt->executeQuery();
// 		res->next();
		
//         if(res->getInt("user_type")==0)
// 		{
// 		stmt = con->prepareStatement("SELECT * FROM user WHERE username= ? ");
// 		stmt->setString(1, username);
// 		res = stmt->executeQuery();
// 		sql::ResultSet* pom;
// 		int id;
// 		while (res->next()) {
// 			id=res->getInt("iduser");
// 			stmt = con->prepareStatement("SELECT * FROM driver where iduser= ?");
// 		    stmt->setInt(1, id);
// 		    pom = stmt->executeQuery();
// 			pom->next();
// 			crow::json::wvalue::object tmp;
// 			tmp["username"] = res->getString("username");
// 			tmp["deleted"] = res->getInt("deleted")?"True":"False";
// 			tmp["suspended"] = pom->getInt("suspended")?"True":"False";
// 			tmp["name"] = res->getString("name");
			
// 			result[pom->getString("iddriver")] = tmp;
// 		}
// 		}
// 		else
// 		{
// 			std::string message="Error: User does not have authorization.";
// 		    result["Message"]=message;
// 		}

// 		delete res;
// 		delete stmt;
// 		delete con;
// 		return result;

// 	}
// 	catch (sql::SQLException& e)										
// 	{																					
// 		std::cout << "# ERR: SQLException in " << __FILE__;								
// 		std::cout << "(" << __FUNCTION__ << ") on line " << __LINE__ << std::endl;		
// 		std::cout << "# ERR: " << e.what();												
// 		std::cout << " (MySQL error code: " << e.getErrorCode();						
// 		std::cout << ", SQLState: " << e.getSQLState() << " )" << std::endl;			
// 		crow::json::wvalue ret;															
// 		ret["ERROR:"] = e.what();															
// 		return  ret;																
// 	}		
// }

// crow::json::wvalue passenger_details(const std::string username,const std::string authorization)
// {
// 	try
// 	{
// 		sql::Driver* driver;
// 		sql::Connection* con;
// 		sql::PreparedStatement* stmt;
// 		sql::ResultSet* res;
// 		crow::json::wvalue result;

// 		driver = get_driver_instance();
// 		con = driver->connect(getenv("DB_HOST"), getenv("DB_USER"), getenv("DB_PASSWORD"));
// 		std::cout<<"Connected"<<std::endl;
// 		con->setSchema(getenv("DB_NAME"));
        
// 		std::string user=jwt_return_username(authorization);
// 		stmt = con->prepareStatement("SELECT * FROM user WHERE username=  ?");
// 		stmt->setString(1, user);
// 		res = stmt->executeQuery();
// 		res->next();
		
//         if(res->getInt("user_type")==0)
// 		{
// 		stmt = con->prepareStatement("SELECT * FROM user WHERE username= ? ");
// 		stmt->setString(1, username);
// 		res = stmt->executeQuery();
// 		sql::ResultSet* pom;
// 		int id;
// 		while (res->next()) {
// 			id=res->getInt("iduser");
// 			stmt = con->prepareStatement("SELECT * FROM passenger where iduser= ?");
// 		    stmt->setInt(1, id);
// 		    pom = stmt->executeQuery();
// 			pom->next();
// 			crow::json::wvalue::object tmp;
// 			tmp["username"] = res->getString("username");
// 			tmp["deleted"] = res->getInt("deleted")?"True":"False";
// 			tmp["suspended"] = pom->getInt("suspended")?"True":"False";
// 			tmp["name"] = res->getString("name");
			
// 			result[pom->getString("idpassenger")] = tmp;
// 		}
// 		}
// 		else
// 		{
// 			std::string message="Error: User does not have authorization.";
// 		    result["Message"]=message;
// 		}

// 		delete res;
// 		delete stmt;
// 		delete con;
// 		return result;

// 	}
// 	catch (sql::SQLException& e)										
// 	{																					
// 		std::cout << "# ERR: SQLException in " << __FILE__;								
// 		std::cout << "(" << __FUNCTION__ << ") on line " << __LINE__ << std::endl;		
// 		std::cout << "# ERR: " << e.what();												
// 		std::cout << " (MySQL error code: " << e.getErrorCode();						
// 		std::cout << ", SQLState: " << e.getSQLState() << " )" << std::endl;			
// 		crow::json::wvalue ret;															
// 		ret["ERROR:"] = e.what();															
// 		return  ret;																
// 	}		
// }

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

crow::json::wvalue suspension(const std::string username,const std::string authorization)
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

        std::string user=jwt_return_username(authorization);
		stmt = con->prepareStatement("SELECT * FROM user where username=  ?");
		stmt->setString(1, user);
		res = stmt->executeQuery();
		res->next();
        if(res->getInt("user_type")==0)
		{
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
		std::string message="Error: Unable to suspend account";
		result["Message"]=message;	
		}
		}
		else
		{
			std::string message="Error: User does not have authorization.";
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
crow::json::wvalue activation(const std::string username,const std::string authorization)
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

		std::string user=jwt_return_username(authorization);
		stmt = con->prepareStatement("SELECT * FROM user where username=  ?");
		stmt->setString(1, user);
		res = stmt->executeQuery();
		res->next();
        if(res->getInt("user_type")==0)
		{
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
		std::string message="Error: Unable to activate account.";
		result["Message"]=message;	
		}
		}
		else
		{
            std::string message="Error: User does not have authorization.";
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
		std::string message="Error: Account can not be deleted";
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
            message="Error: New password and old password are the same.";
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
	CROW_ROUTE(app, "/list").methods(crow::HTTPMethod::GET)([](const crow::request& req)
		{
			const std::string authorization = req.get_header_value("authorization");
			std::vector<std::string> split;
            boost::split(split,authorization,boost::is_any_of(" "));
			return list_users(split[1]);
		});
	CROW_ROUTE(app, "/login").methods(crow::HTTPMethod::GET)([](const crow::request& req)
		{
			const std::string username = req.get_header_value("username");
			const std::string password = req.get_header_value("password");
			crow::json::wvalue result = login_user(username, password);
			return result;
		});
		CROW_ROUTE(app, "/register").methods(crow::HTTPMethod::POST)([](const crow::request& req)
		{
			const std::string username = req.get_header_value("username");
			const std::string password = req.get_header_value("password");
			const std::string name = req.get_header_value("name");
			const std::string user_type=req.get_header_value("user_type");
			crow::json::wvalue result = register_user(username, password,name,user_type);
			return result;
		});
		CROW_ROUTE(app, "/edit_profile").methods(crow::HTTPMethod::PUT)([](const crow::request& req)
		{
			const std::string username = req.get_header_value("username");
			const std::string name = req.get_header_value("name");
			crow::json::wvalue result = edit_profile(username,name);
			return result;
		});
		CROW_ROUTE(app, "/suspension").methods(crow::HTTPMethod::PUT)([](const crow::request& req)
		{
			const std::string username = req.get_header_value("username");
			const std::string authorization = req.get_header_value("authorization");
			std::vector<std::string> split;
            boost::split(split,authorization,boost::is_any_of(" "));
			crow::json::wvalue result = suspension(username,split[1]);
			return result;
		});
		CROW_ROUTE(app, "/activation").methods(crow::HTTPMethod::PUT)([](const crow::request& req)
		{
			const std::string username = req.get_header_value("username");
			const std::string authorization = req.get_header_value("authorization");
			std::vector<std::string> split;
            boost::split(split,authorization,boost::is_any_of(" "));
			crow::json::wvalue result = activation(username,split[1]);
			return result;
		});
		CROW_ROUTE(app, "/delete").methods(crow::HTTPMethod::PUT)([](const crow::request& req)
		{
			const std::string username = req.get_header_value("username");
			crow::json::wvalue result = delete_user(username);
			return result;
		});

		CROW_ROUTE(app, "/password_change").methods(crow::HTTPMethod::PUT)([](const crow::request& req)
		{
			const std::string username = req.get_header_value("username");
			const std::string old_password = req.get_header_value("old_password");
            const std::string new_password = req.get_header_value("new_password");
			crow::json::wvalue result = password_change(username,new_password,old_password);
			return result;
		});

		CROW_ROUTE(app, "/list_drivers").methods(crow::HTTPMethod::GET)([](const crow::request& req)
		{
			const std::string authorization = req.get_header_value("authorization");
			std::vector<std::string> split;
            boost::split(split,authorization,boost::is_any_of(" "));
			return list_drivers(split[1]);
		});
		// CROW_ROUTE(app, "/driver_details").methods(crow::HTTPMethod::GET)([](const crow::request& req)
		// {
		// 	const std::string username = req.get_header_value("username");
		// 	const std::string authorization = req.get_header_value("authorization");
		// 	std::vector<std::string> split;
        //     boost::split(split,authorization,boost::is_any_of(" "));
		// 	crow::json::wvalue result = driver_details(username, split[1]);
		// 	return result;
		// });
		// CROW_ROUTE(app, "/passenger_details").methods(crow::HTTPMethod::GET)([](const crow::request& req)
		// {
		// 	const std::string username = req.get_header_value("username");
		// 	const std::string authorization = req.get_header_value("authorization");
		// 	std::vector<std::string> split;
        //     boost::split(split,authorization,boost::is_any_of(" "));
		// 	crow::json::wvalue result = passenger_details(username, split[1]);
		// 	return result;
		// });
		CROW_ROUTE(app, "/list_passengers").methods(crow::HTTPMethod::GET)([](const crow::request& req)
		{
			const std::string authorization = req.get_header_value("authorization");
			std::vector<std::string> split;
            boost::split(split,authorization,boost::is_any_of(" "));
			return list_passengers(split[1]);
		});


	std::cout<<"Running on: http://120.0.0.1:3002"<<std::endl;
	app.port(params::port).run();
	return 0;
}

