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
		std::cout<<"Connecting: "<<params::db_address<<"	"<<params::db_user<<"	"<<params::db_password<<"	" <<std::endl;
		con = driver->connect(params::db_address, params::db_user, params::db_password);
		std::cout<<"Connected"<<std::endl;
		con->setSchema(params::db_name);

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
	std::cout<<"Running on: http://120.0.0.1:3001"<<std::endl;
	app.port(params::port).run();
	return 0;
}

