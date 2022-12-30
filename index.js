const mysql = require('mysql2');
const inquirer = require('inquirer');
require('console.table');

// check join query activities 25/26 to NOT display department_id
// use inquirer prompt to create menus
// create connection file to database
// create query for displaying information / adding information to table

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'Firefly!12',
        database: 'employee_db'
    },
    console.log(`Connected to employee_db database`)
);

// arrays of options for user input
const options = [
    {
        type: 'list',
        name: 'options',
        message: "What would you like to do?",
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Exit App']
    }
];

function viewAllEmployees() {
    db.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id;",
    (err, data) => {
        console.table(data);
        init();
    });
}

function addEmployee() {
    db.query("SELECT id, title FROM role;", 
    (err, data) => {
        let role_id = data.map(element => {
            return ({
                name: element.title,
                value: element.id
            })
        })
        db.query("SELECT id, first_name, last_name FROM employee WHERE manager_id is null;", 
        (err, data) => {
          let manager_id = (data.map(element => {
                return({
                    name: element.first_name+" "+element.last_name,
                    value: element.id
                })
            }))
        manager_id.push({name:"N/A",value:null})
        // console.log(manager_id,role_id)
        inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: "What is the employee's first name?"
            },
            {
                type: 'input',
                name: 'lastName',
                message: "What is employee's the last name?"
            },
            {
                type: 'list',
                name: 'role_id',
                choices: role_id,
                message:"What is the employee's role?"
            },
            {
                type: 'list',
                name: 'manager_id',
                choices: manager_id,
                message: "Who is the employee's manager?"
            }
        ]).then(response => {
            db.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?);",
            [response.firstName,response.lastName,response.role_id, response.manager_id],
            (err, data) => {
                // console.table(data);
                init();
            });
        })
        
    })
})
}

function updateEmployeeRole() {
    db.query("SELECT e.id, e.first_name, e.last_name FROM employee e;",
    (err, data) => {
        let employeeList = data.map(element => {
            return({
                name: element.first_name+" "+element.last_name,
                value: element.id
            })
        })
        db.query("SELECT title, id FROM role;",
        (err, data) => {
            let roleList = data.map(element =>
                {
                    return({
                        name: element.title,
                        value: element.id
                    })
                })
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'selectEmployee',
                    choices: employeeList,
                    message: "Which employee's role do you want to update?"
                },
                {
                    type: 'list',
                    name: 'updateEmployeeRole',
                    choices: roleList,
                    message: "Which role do you want to assign the selected employee?"
                }
            ]).then(response => {
                db.query("UPDATE employee SET role_id = ? WHERE id = ?;",
                [response.updateEmployeeRole, response.selectEmployee],
                (err, data) => {
                    // console.log(data);
                    console.log(`Updated employee's role`);
                    init();
                })
            })
        })
    })
}

function viewAllRoles() {
    db.query("SELECT r.id, r.title, d.name AS 'department', r.salary FROM role r, department d WHERE r.department_id = d.id;",
    (err, data) => {
        console.table(data);
        init();
    });
}

function addRole() {
    db.query("SELECT id, name FROM department;",
    (err, data) => {
        let department_name = data.map(element => {
            return ({
                name: element.name,
                value: element.id
            });
        });
        // console.log(department_name);
        inquirer.prompt([
            {
                type: 'input',
                name: 'roleName',
                message: 'What is the name of the role?'
            },
            {
                type: 'input',
                name: 'roleSalary',
                message: 'What is the salary of the role?'
            },
            {
                type: 'list',
                name: 'departmentAssignment',
                choices: department_name,
                message: 'Which department does the role belong to?'
            }
        ]).then(response => {
            db.query("INSERT INTO role (title, salary, department_id) VALUE (?,?,?);",
            [response.roleName, response.roleSalary, response.departmentAssignment],
            (err, data) => {
                console.log(`Added ${response.roleName} to the database`);
                init();
            })
        });
    });
}

function viewAllDepartments() {
    db.query("SELECT d.id, d.name FROM department d;",
    (err, data) => {
        console.table(data);
        init();
    });
}

function addDepartment() {
    db.query("SELECT id, name FROM department;",
    (err, data) => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'addDepartment',
                message: "What is the name of the department?"
            }
        ]).then(response => {
            db.query("INSERT INTO department (name) VALUES (?);",
            [response.addDepartment],
            (err, data) => {
                // console.table(data);
                console.log(`Added ${response.addDepartment} to the database`)
                init();
            });
        });
    });
}

function exitApp() {
    process.exit();
}

function init() {
    inquirer
        .prompt(options)
        .then(({options }) => {
            switch (options) {
                case "View All Employees":
                    viewAllEmployees();
                    break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Update Employee Role":
                    updateEmployeeRole();
                    break;
                case "View All Roles":
                    viewAllRoles();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "View All Departments":
                    viewAllDepartments();
                    break;
                case "Add Department":
                    addDepartment();
                    break;
                case "Exit App":
                    exitApp();
                    break;
                default:
                    db.end()
                    process.exit(0)
            }
        })
}

init();