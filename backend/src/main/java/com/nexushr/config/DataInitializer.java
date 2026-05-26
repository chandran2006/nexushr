package com.nexushr.config;

import com.nexushr.entity.Department;
import com.nexushr.entity.User;
import com.nexushr.repository.DepartmentRepository;
import com.nexushr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.countByDeletedFalse() > 0) return;

        // Seed departments
        String[][] depts = {
            {"Engineering", "ENG", "Software Engineering"},
            {"Human Resources", "HR", "Human Resources"},
            {"Finance", "FIN", "Finance & Accounting"},
            {"Marketing", "MKT", "Marketing"},
            {"Operations", "OPS", "Operations"},
            {"Product", "PRD", "Product Management"},
        };
        for (String[] d : depts) {
            departmentRepository.save(Department.builder()
                .name(d[0]).code(d[1]).description(d[2]).build());
        }

        // Demo users — one per role, all password: Demo@1234
        String encoded = passwordEncoder.encode("Demo@1234");
        Object[][] users = {
            {"Super",   "Admin",   "admin@nexushr.com",     User.UserRole.SUPER_ADMIN, "EMP000001"},
            {"HR",      "Admin",   "hradmin@nexushr.com",   User.UserRole.HR_ADMIN,    "EMP000002"},
            {"HR",      "Manager", "hrmanager@nexushr.com", User.UserRole.HR_MANAGER,  "EMP000003"},
            {"John",    "Employee","employee@nexushr.com",  User.UserRole.EMPLOYEE,    "EMP000004"},
            {"Finance", "Officer", "finance@nexushr.com",   User.UserRole.FINANCE,     "EMP000005"},
            {"Exec",    "Director","executive@nexushr.com", User.UserRole.EXECUTIVE,   "EMP000006"},
        };

        for (Object[] u : users) {
            userRepository.save(User.builder()
                .firstName((String) u[0])
                .lastName((String) u[1])
                .email((String) u[2])
                .password(encoded)
                .role((User.UserRole) u[3])
                .status(User.UserStatus.ACTIVE)
                .employeeId((String) u[4])
                .emailVerified(true)
                .build());
        }

        log.info("=================================================");
        log.info("  Demo users seeded — password for all: Demo@1234");
        log.info("  admin@nexushr.com       -> SUPER_ADMIN");
        log.info("  hradmin@nexushr.com     -> HR_ADMIN");
        log.info("  hrmanager@nexushr.com   -> HR_MANAGER");
        log.info("  employee@nexushr.com    -> EMPLOYEE");
        log.info("  finance@nexushr.com     -> FINANCE");
        log.info("  executive@nexushr.com   -> EXECUTIVE");
        log.info("=================================================");
    }
}
