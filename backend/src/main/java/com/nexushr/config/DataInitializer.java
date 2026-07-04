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
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedDepartments();
        seedUsers();
    }

    private void seedDepartments() {
        String[][] depts = {
            {"Engineering",     "ENG", "Software Engineering & Architecture"},
            {"Human Resources", "HR",  "Human Resources & People Operations"},
            {"Finance",         "FIN", "Finance, Accounting & Payroll"},
            {"Marketing",       "MKT", "Marketing & Brand"},
            {"Operations",      "OPS", "Operations & Logistics"},
            {"Product",         "PRD", "Product Management"},
            {"Sales",           "SLS", "Sales & Business Development"},
            {"Legal",           "LGL", "Legal & Compliance"},
        };
        for (String[] d : depts) {
            if (!departmentRepository.existsByCodeAndDeletedFalse(d[1])) {
                departmentRepository.save(Department.builder()
                        .name(d[0]).code(d[1]).description(d[2]).build());
            }
        }
    }

    private void seedUsers() {
        String encoded = passwordEncoder.encode("Demo@1234");

        record UserSeed(String first, String last, String email, User.UserRole role, String empId) {}

        UserSeed[] users = {
            new UserSeed("Super",     "Admin",    "admin@nexushr.com",      User.UserRole.SUPER_ADMIN, "EMP000001"),
            new UserSeed("HR",        "Admin",    "hradmin@nexushr.com",    User.UserRole.HR_ADMIN,    "EMP000002"),
            new UserSeed("HR",        "Manager",  "hrmanager@nexushr.com",  User.UserRole.HR_MANAGER,  "EMP000003"),
            new UserSeed("Team",      "Manager",  "manager@nexushr.com",    User.UserRole.MANAGER,     "EMP000004"),
            new UserSeed("John",      "Employee", "employee@nexushr.com",   User.UserRole.EMPLOYEE,    "EMP000005"),
            new UserSeed("Finance",   "Officer",  "finance@nexushr.com",    User.UserRole.FINANCE,     "EMP000006"),
            new UserSeed("Executive", "Director", "executive@nexushr.com",  User.UserRole.EXECUTIVE,   "EMP000007"),
            new UserSeed("Talent",    "Recruiter","recruiter@nexushr.com",  User.UserRole.RECRUITER,   "EMP000008"),
        };

        boolean anyCreated = false;
        for (UserSeed u : users) {
            if (!userRepository.existsByEmailAndDeletedFalse(u.email())) {
                userRepository.save(User.builder()
                        .firstName(u.first())
                        .lastName(u.last())
                        .email(u.email())
                        .password(encoded)
                        .role(u.role())
                        .status(User.UserStatus.ACTIVE)
                        .employeeId(u.empId())
                        .emailVerified(true)
                        .build());
                anyCreated = true;
            }
        }

        if (anyCreated) {
            log.info("=================================================");
            log.info("  Demo users ready — password: Demo@1234");
            log.info("  admin@nexushr.com       -> SUPER_ADMIN");
            log.info("  hradmin@nexushr.com     -> HR_ADMIN");
            log.info("  hrmanager@nexushr.com   -> HR_MANAGER");
            log.info("  manager@nexushr.com     -> MANAGER");
            log.info("  employee@nexushr.com    -> EMPLOYEE");
            log.info("  finance@nexushr.com     -> FINANCE");
            log.info("  executive@nexushr.com   -> EXECUTIVE");
            log.info("  recruiter@nexushr.com   -> RECRUITER");
            log.info("=================================================");
        }
    }
}
