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
			tmp["user_type"]=res->getInt("user_type")?(res->getInt("user_type")==1?"Driver":"Passenger"):"Admin";
			
			result[res->getString("iduser")] = tmp;
		}
		}
		else
		{
			std::string message="User does not have authorization.";
		    return result["Error"]=message;
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
			std::string message="User does not have authorization.";
		    return result["Error"]=message;
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
			std::string message="User does not have authorization.";
		    return result["Error"]=message;
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

crow::json::wvalue driver_details(const std::string username,const std::string authorization)
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
		stmt = con->prepareStatement("SELECT * FROM user WHERE username=  ?");
		stmt->setString(1, user);
		res = stmt->executeQuery();
		res->next();
		
        if(res->getInt("user_type")==0)
		{
		stmt = con->prepareStatement("SELECT * FROM user WHERE username= ? ");
		stmt->setString(1, username);
		res = stmt->executeQuery();
		sql::ResultSet* pom;
		int id;
		while (res->next()) {
			id=res->getInt("iduser");
			stmt = con->prepareStatement("SELECT * FROM driver where driver.iduser= ?");
		    stmt->setInt(1, id);
		    pom = stmt->executeQuery();
			if(pom->next())
			{
			crow::json::wvalue::object tmp;
			tmp["username"] = res->getString("username");
			tmp["deleted"] = res->getInt("deleted")?"True":"False";
			tmp["suspended"] = pom->getInt("suspended")?"True":"False";
			tmp["name"] = res->getString("name");
			
			result[pom->getString("iddriver")] = tmp;
			}
			else
			{
				std::string message="Driver with this username does not exist.";
                return result["Error"]=message;
			}
		}
		}
		else
		{
			std::string message="User does not have authorization.";
		    return result["Error"]=message;
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

crow::json::wvalue passenger_details(const std::string username,const std::string authorization)
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
		stmt = con->prepareStatement("SELECT * FROM user WHERE username=  ?");
		stmt->setString(1, user);
		res = stmt->executeQuery();
		res->next();
		
        if(res->getInt("user_type")==0)
		{
		stmt = con->prepareStatement("SELECT * FROM user WHERE username= ? ");
		stmt->setString(1, username);
		res = stmt->executeQuery();
		sql::ResultSet* pom;
		int id;
		while (res->next()) {
			id=res->getInt("iduser");
			stmt = con->prepareStatement("SELECT * FROM passenger where passenger.iduser= ?");
		    stmt->setInt(1, id);
		    pom = stmt->executeQuery();
			if(pom->next())
			{
			crow::json::wvalue::object tmp;
			tmp["username"] = res->getString("username");
			tmp["deleted"] = res->getInt("deleted")?"True":"False";
			tmp["suspended"] = pom->getInt("suspended")?"True":"False";
			tmp["name"] = res->getString("name");
			
			result[pom->getString("idpassenger")] = tmp;
			}
			else 
			{
				std::string message="Passenger with this username does not exist.";
		        return result["Error"]=message;
			}
		}
		}
		else
		{
			std::string message="User does not have authorization.";
		    return result["Error"]=message;
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
		if(res->next())
		{
		do {
			sql::ResultSet* pom;
			// Stavljate u result objekat
			result["username"] = res->getString("username");
			result["name"] = res->getString("name");
			result["user_type"]=res->getInt("user_type")?(res->getInt("user_type")==1?"Driver":"Passenger"):"Admin";
			if(res->getInt("login_num")==params::login_limit)
			{
			result["password_change"] = "true";
			}
			else if(res->getInt("login_num")>params::login_limit)
			{
			result["Error"]="The number of logins exceeds the limit.";
			}
			else
			{
            result["password_change"] = "false";
			int number_login=res->getInt("login_num");
			number_login++;
			stmt = con->prepareStatement("UPDATE user SET login_num=? WHERE username=?");
		    stmt->setInt(1, number_login);
			stmt->setString(2,username);
		    pom = stmt->executeQuery();
			}
			if(res->getInt("deleted")==1)
			{
				stmt = con->prepareStatement("UPDATE user SET deleted=? WHERE username=?");
		        stmt->setInt(1, 0);
				stmt->setString(2,username);
		        pom = stmt->executeQuery();
			}
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
		} while (res->next());
		}
		else
		{
			std::string message="Username does not exist.";
		     return result["Error"]=message;
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
		if(username.empty()){
			std::string message="You must enter a username.";
			return result["Error"]=message;
		}
		else if(password_p.empty()){
			std::string message="You must enter a password.";
			return result["Error"]=message;
		}
		else if(name.empty()){
			std::string message="You must enter a name.";
			return result["Error"]=message;
		}
		else if(user_type.empty()){
			std::string message="You must enter user type.";
			return result["Error"]=message;
		}

		stmt = con->prepareStatement("SELECT * FROM user WHERE user.username=?");
		stmt->setString(1, username);
		res=stmt->executeQuery();
		res->beforeFirst();
		if(res->next())
		{
		std::string message="Username already exists";
		 return result["Error"]=message;
		}
		else 
		{   
		std::string password= sha256(password_p);
		res->afterLast();
		stmt = con->prepareStatement("INSERT INTO user(username,password,login_num,name,deleted,user_type) VALUES(?,?,?,?,?,?)");
		stmt->setString(1, username);
		stmt->setString(2, password);
		stmt->setInt(3,0);
		stmt->setString(4, name);
		stmt->setInt(5, 0);
		if(user_type=="admin")
		{
		    stmt->setInt(6, 0);
		}
		else if (user_type=="driver")
		{
			stmt->setInt(6, 1);
		}
		else
		{
			stmt->setInt(6, 2);
		}
		res=stmt->executeQuery();
		stmt = con->prepareStatement("SELECT * FROM user WHERE user.username=?");
		stmt->setString(1, username);
        res=stmt->executeQuery();
		res->next();
		int iduser=res->getInt("iduser");
		if (user_type=="driver")
		{
		stmt = con->prepareStatement("INSERT INTO driver(iduser,suspended) VALUES(?,?)");
		stmt->setInt(1, iduser);
		stmt->setInt(2, 0);
		res=stmt->executeQuery();
		}
		else if (user_type=="passenger")
		{
		stmt = con->prepareStatement("INSERT INTO passenger(iduser,suspended) VALUES(?,?)");
		stmt->setInt(1, iduser);
		stmt->setInt(2, 0);
		res=stmt->executeQuery();
		}
		std::string message="true";
		return result["Status"]=message;
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
        
		stmt = con->prepareStatement("SELECTE * FROM user WHERE user.username=?");
		stmt->setString(1, username);
		res=stmt->executeQuery();
        if(res->next())
		{
        stmt = con->prepareStatement("UPDATE user SET name=? WHERE user.username=?");
		stmt->setString(1, new_name);
		stmt->setString(2, username);
		res=stmt->executeQuery();
		std::string message="Name changed";
		return result["Message"]=message;
		}
		else
		{
			std::string message="User with this username does not exist.";
		    return result["Error"]=message;
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
		if(res->next())
		{
		int iduser=res->getInt("iduser");
		if(res->getInt("deleted"))
		{
			std::string message="Unable to suspend account. Account is deleted.";
			return result["Error"]=message;
		}
		if(res->getInt("user_type")==2)
		{
		stmt = con->prepareStatement("UPDATE passenger SET suspended=? WHERE passenger.iduser=?");
		stmt->setInt(1,1);
		stmt->setInt(2,iduser);
		res=stmt->executeQuery();
		std::string message="Account suspended";
		return result["Message"]=message;
		}
		else if (res->getInt("user_type")==1)
		{
		stmt = con->prepareStatement("UPDATE driver SET suspended=? WHERE driver.iduser=?");
		stmt->setInt(1,1);
		stmt->setInt(2,iduser);
		res=stmt->executeQuery();
	    std::string message="Account suspended";
		return result["Message"]=message;
		}
		else
		{
		std::string message="Unable to suspend account";
		return result["Error"]=message;	
		}
		}
		else
		{
			std::string message="User with this username does not exist.";
		    return result["Error"]=message;
		}
		}
		else
		{
			std::string message="User does not have authorization.";
		    return result["Error"]=message;
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
		if(res->next())
		{
		int iduser=res->getInt("iduser");
		if(res->getInt("deleted"))
		{
			std::string message="Unable to suspend account. Account is deleted.";
			return result["Error"]=message;
		}
		if(res->getInt("user_type")==2)
		{
		stmt = con->prepareStatement("UPDATE passenger SET suspended=? WHERE passenger.iduser=?");
		stmt->setInt(1,0);
		stmt->setInt(2,iduser);
		res=stmt->executeQuery();
		std::string message="Account activated";
		return result["Message"]=message;
		}
		else if (res->getInt("user_type")==1)
		{
		stmt = con->prepareStatement("UPDATE driver SET suspended=? WHERE driver.iduser=?");
		stmt->setInt(1,0);
		stmt->setInt(2,iduser);
		res=stmt->executeQuery();
	    std::string message="Account activated";
		return result["Message"]=message;
		}
		else
		{
		std::string message="Unable to activate account.";
		return result["Error"]=message;	
		}
		}
		else{
			std::string message="User with this username does not exist.";
		    return result["Error"]=message;
		}
		}
		else
		{
            std::string message="User does not have authorization.";
		    return result["Error"]=message;
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
		if(res->next())
		{
		stmt = con->prepareStatement("UPDATE user SET deleted=? WHERE user.username=?");
		stmt->setInt(1,1);
		stmt->setString(2,username);
		res=stmt->executeQuery();
		std::string message="Account deleted";
		return result["Message"]=message;	
		}
		else
		{
			std::string message="User with this username does not exist.";
		return result["Error"]=message;	
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

		stmt = con->prepareStatement("SELECT * FROM user WHERE user.username=?");
		stmt->setString(1, username);
		res=stmt->executeQuery();
		if(res->next())
		{
        if(old_password != new_password){
			sql::ResultSet* pom;
            std::string protected_password = sha256(new_password);
            stmt = con->prepareStatement("UPDATE user SET password=? WHERE user.username=?");
		    stmt->setString(1, protected_password);
		    stmt->setString(2, username);
		    res=stmt->executeQuery();
            stmt = con->prepareStatement("UPDATE user SET login_num=? WHERE user.username=?");
		    stmt->setInt(1, 0);
		    stmt->setString(2, username);
		    res=stmt->executeQuery();
		    std::string message="Password changed";
		    return result["Message"]=message;
        }
        else{
            std::string message="New password and old password are the same.";
            return result["Error"]=message;
            }
		}
		else
		{
			std::string message="User with this username does not exist.";
		    return result["Error"]=message;	

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
	CROW_ROUTE(app, "/list").methods("GET"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string authorization = req.get_header_value("authorization");
			std::vector<std::string> split;
            boost::split(split,authorization,boost::is_any_of(" "));
			crow::json::wvalue result= list_users(split[1]);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});
	CROW_ROUTE(app, "/login").methods("GET"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string username = params.get("username");
			const std::string password = params.get("password");
			crow::json::wvalue result = login_user(username, password);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});
		CROW_ROUTE(app, "/register").methods("POST"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string username = params.get("username");
			const std::string password = params.get("password");
			const std::string name = params.get("name");
			const std::string user_type=params.get("user_type");
			crow::json::wvalue result = register_user(username, password,name,user_type);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});
		CROW_ROUTE(app, "/edit_profile").methods("PUT"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string username = params.get("username");
			const std::string new_name = params.get("new_name");
			crow::json::wvalue result = edit_profile(username,new_name);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});
		CROW_ROUTE(app, "/suspension").methods("PUT"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string username = params.get("username");
			const std::string authorization = req.get_header_value("authorization");
			std::vector<std::string> split;
            boost::split(split,authorization,boost::is_any_of(" "));
			crow::json::wvalue result = suspension(username,split[1]);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});
		CROW_ROUTE(app, "/activation").methods("PUT"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string username = params.get("username");
			const std::string authorization = req.get_header_value("authorization");
			std::vector<std::string> split;
            boost::split(split,authorization,boost::is_any_of(" "));
			crow::json::wvalue result = activation(username,split[1]);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});
		CROW_ROUTE(app, "/delete").methods("PUT"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string username = params.get("username");
			crow::json::wvalue result = delete_user(username);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});

		CROW_ROUTE(app, "/password_change").methods("PUT"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string username = params.get("username");
			const std::string old_password = params.get("old_password");
            const std::string new_password =params.get("new_password");
			crow::json::wvalue result = password_change(username,new_password,old_password);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});

		CROW_ROUTE(app, "/list/drivers").methods("GET"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string authorization = req.get_header_value("authorization");
			std::vector<std::string> split;
            boost::split(split,authorization,boost::is_any_of(" "));
			crow::json::wvalue result= list_drivers(split[1]);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});
		CROW_ROUTE(app, "/driver/details").methods("GET"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string username =params.get("username");
			const std::string authorization = req.get_header_value("authorization");
			std::vector<std::string> split;
            boost::split(split,authorization,boost::is_any_of(" "));
			crow::json::wvalue result = driver_details(username, split[1]);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});
		CROW_ROUTE(app, "/passenger/details").methods("GET"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string username =params.get("username");
			const std::string authorization = req.get_header_value("authorization");
			std::vector<std::string> split;
            boost::split(split,authorization,boost::is_any_of(" "));
			crow::json::wvalue result = passenger_details(username, split[1]);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});
		CROW_ROUTE(app, "/list/passengers").methods("GET"_method)([](const crow::request& req)
		{
			crow::query_string params = req.url_params;
			const std::string authorization = req.get_header_value("authorization");
			std::vector<std::string> split;
            boost::split(split,authorization,boost::is_any_of(" "));
			crow::json::wvalue result= list_passengers(split[1]);
			crow::response resp(result);
			resp.add_header("Access-Control-Allow-Origin", "*");
			return resp;
		});


	std::cout<<"Running on: http://120.0.0.1:3002"<<std::endl;
	app.port(params::port).run();
	return 0;
}

