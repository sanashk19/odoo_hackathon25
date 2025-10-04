"# Hackathon Odoo25" 
# Expense Management System

A web-based platform designed for streamlined submission, automated approval, and transparent tracking of company expenses. This system caters to employees, managers, and admins, offering multi-level approvals, flexible rules, and smart automation.

---

## Team SafeNavi

- Jiya Haldankar  
- Shriya Baht  
- Sana Shaikh  
- Prachi Naik

---

## Features

- **User Roles & Authentication:** Secure registration and login. Company profile and default currency setup on first signup. Admins manage roles (employee, manager, admin) and relationships.
- **Expense Submission:** Employees submit expenses with amount (any currency), category, date, description, and attach/scan receipts using OCR for auto-filling details.
- **Approval Workflow:** Managers receive structured queues to review, approve/reject with comments, and track status. Multi-level approvals with admin-configurable flows (e.g., percent approval, specific mandatory approvers, hybrid rules).
- **Admin Controls:** Full user management, approval flow design, expense override, and transparent monitoring.
- **Real-Time Currency Conversion:** Automatic conversion for all expenses into the company’s default currency for clarity.
- **Transparency:** All users can view relevant approval history and statuses, ensuring accountability.

---

## Workflow

1. **Registration:** Admin creates company and configures users/roles.
2. **Submission:** Employees log in, submit expenses (manual/receipt scan), and track their claims.
3. **Approval:** Managers receive notifications, review, and act. Multi-approver and conditional logic apply as required.
4. **Admin Oversight:** Admin manages rules, views all transactions, and can intervene or adjust approvals when necessary.
5. **Settlement:** Approved expenses appear in payout queue with transparent logs.

---

## Pages & Wireframes

- **Login/Signup:** Access control with role-based dashboard redirection.
- **Employee Dashboard:** Expense form, status table, and receipt scanner.
- **Manager View:** Pending approvals table, workflow tracking, and bulk actions.
- **Admin Panel:** User/role management, approval rule builder, and master expense table.
- **Currency Display:** Transaction records always shown in both submitted and converted currencies.

---

## Unique Features

1. **OCR-Powered Submission:** Scan receipts to auto-complete expense forms.
2. **Flexible Multi-Stage Approvals:** Set rules by percent, key approvers, or combinations.
3. **Live Currency Conversion:** Always up-to-date conversion rates ensure accurate expense tracking and approval.

---

## Getting Started

1. Clone the repository.
2. Set up environment variables for authentication and currency APIs.
3. Install dependencies and start backend and frontend servers.
4. Register an admin account and follow workflow starting from company setup.

---

## License

This project is licensed under the MIT License.

---

## Contact

For support or contributions, please open an issue or submit a pull request.
