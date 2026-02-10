
export const EmailTemplates = {
    // 1. Welcome Email (New Employee)
    welcomeEmail: (name: string, email: string, role: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #001529;">Welcome to the Team, ${name}! 🎉</h1>
            </div>
            <p style="color: #555; font-size: 16px;">Hello ${name},</p>
            <p style="color: #555; font-size: 16px;">We are thrilled to have you onboard as a <strong>${role}</strong>. Your account has been created successfully.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📧 Login Email:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>🔑 Password:</strong> (As set by admin)</p>
            </div>

            <p style="color: #555;">Please log in to your dashboard to complete your profile and view your schedule.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}" style="background-color: #FF6B00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
            </div>
        </div>
    `,

    // 2. Leave Status Update
    leaveStatus: (name: string, type: string, dates: string, status: string, approvedBy: string) => {
        const color = status === 'Approved' ? '#10b981' : '#ef4444';
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #001529;">Leave Request Update 📅</h2>
            <p style="color: #555;">Hello ${name},</p>
            <p style="color: #555;">Your request for <strong>${type}</strong> on <strong>${dates}</strong> has been:</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <span style="background-color: ${color}; color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold; font-size: 18px;">
                    ${status.toUpperCase()}
                </span>
            </div>

            <p style="color: #777; font-size: 14px;">Processed by: ${approvedBy}</p>
        </div>
        `;
    },

    // 3. Payslip Notification
    payslipGenerated: (name: string, month: string, year: number) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #001529;">Payslip Generated 💰</h2>
            <p style="color: #555;">Hello ${name},</p>
            <p style="color: #555;">Your payslip for <strong>${month} ${year}</strong> has been generated and is attached to this email.</p>
            <p style="color: #555;">You can also view and download it from your employee dashboard.</p>
        </div>
    `,

    // 4. Admin Attendance Alert via Email
    adminAttendanceAlert: (employeeName: string, type: 'CheckIn' | 'CheckOut', time: string, status: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; border-left: 5px solid #FF6B00;">
            <h3 style="color: #001529; margin-top: 0;">🔔 Attendance Alert</h3>
            <p style="font-size: 16px;"><strong>${employeeName}</strong> just checked ${type === 'CheckIn' ? 'IN' : 'OUT'}.</p>
            
            <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 8px;">⏰ <strong>Time:</strong> ${time}</li>
                <li style="margin-bottom: 8px;">📍 <strong>Status:</strong> ${status}</li>
            </ul>
        </div>
    `,

    // 5. General Announcement
    announcementEmail: (title: string, content: string, author: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="background-color: #f3f4f6; padding: 10px; text-align: center; border-radius: 8px 8px 0 0;">
                <h2 style="color: #001529; margin: 0;">📢 New Announcement</h2>
            </div>
            <div style="padding: 20px;">
                <h3 style="color: #111827; margin-top: 0;">${title}</h3>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">${content}</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="color: #6b7280; font-size: 14px;">Posted by: <strong>${author}</strong></p>
            </div>
        </div>
    `,

    // 6. Task Assigned
    taskAssignedEmail: (title: string, dueDate: string, priority: string, assigneeName: string) => {
        const priorityColor = priority === 'High' ? '#ef4444' : priority === 'Medium' ? '#f59e0b' : '#10b981';
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #001529;">✅ New Task Assigned</h2>
            <p style="color: #555;">Hello ${assigneeName},</p>
            <p style="color: #555;">You have been assigned a new task:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0;">${title}</h3>
                <p style="margin: 5px 0;">📅 <strong>Due Date:</strong> ${dueDate}</p>
                <p style="margin: 5px 0;">⚡ <strong>Priority:</strong> <span style="color: ${priorityColor}; font-weight: bold;">${priority}</span></p>
            </div>

            <p style="color: #555;">Please prioritize this and update the status on your dashboard.</p>
        </div>
        `;
    },

    // 7. Goal Assigned
    goalAssignedEmail: (title: string, deadline: string, type: string, assigneeName: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #001529;">🎯 New Goal Set</h2>
            <p style="color: #555;">Hello ${assigneeName},</p>
            <p style="color: #555;">A new performance goal has been assigned to you:</p>
            
            <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #bfdbfe;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af;">${title}</h3>
                <p style="margin: 5px 0;">📅 <strong>Target Date:</strong> ${deadline}</p>
                <p style="margin: 5px 0;">📌 <strong>Type:</strong> ${type}</p>
            </div>
            <p style="color: #555;">Good luck! You've got this. 🚀</p>
        </div>
    `,

    // 8. Attendance Action (Employee Notification)
    attendanceActionEmail: (date: string, status: string, name: string) => {
        const color = status === 'Approved' ? '#10b981' : '#ef4444';
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #001529;">Attendance Update ⏱️</h2>
            <p style="color: #555;">Hello ${name},</p>
            <p style="color: #555;">Your attendance record for <strong>${date}</strong> has been updated.</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <span style="background-color: ${color}; color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold; font-size: 18px;">
                    ${status.toUpperCase()}
                </span>
            </div>
        </div>
        `;
    },

    // 9. Admin Leave Request Alert
    adminLeaveRequestAlert: (employeeName: string, leaveType: string, fromDate: string, toDate: string, reason: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; border-top: 5px solid #FF6B00;">
            <h2 style="color: #001529;">🚨 New Leave Request Received</h2>
            <p style="color: #555; font-size: 16px;"><strong>${employeeName}</strong> has submitted a new leave request.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;">👤 <strong>Employee:</strong> ${employeeName}</p>
                <p style="margin: 5px 0;">📅 <strong>Dates:</strong> ${fromDate} to ${toDate}</p>
                <p style="margin: 5px 0;">📌 <strong>Type:</strong> ${leaveType}</p>
                <p style="margin: 5px 0;">💬 <strong>Reason:</strong> ${reason}</p>
            </div>

            <p style="color: #555;">Please log in to the Admin Dashboard to Approve or Reject this request.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/leaves" style="background-color: #001529; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Request</a>
            </div>
        </div>
    `
};
