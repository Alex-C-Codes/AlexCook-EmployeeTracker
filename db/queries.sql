USE employee_db;

-- select e.id, e.first_name,
-- e.last_name, r.title, d.name,
-- r.salary, m.first_name as 'Manager First Name', m.last_name as 'Manager last name' from
-- employee e, department d, role r, employee m where 
-- e.role_id = r.id and
-- r.department_id = d.id and 
-- e.manager_id = m.id;

-- SELECT r.title, r.salary
-- FROM role r