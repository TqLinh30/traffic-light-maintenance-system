package com.grash.service;

import com.grash.factory.MailServiceFactory;
import com.grash.model.Company;
import com.grash.model.Notification;
import com.grash.model.OwnUser;
import com.grash.model.Request;
import com.grash.model.Workflow;
import com.grash.model.enums.NotificationType;
import com.grash.model.enums.PermissionEntity;
import com.grash.model.enums.RoleCode;
import com.grash.model.enums.workflow.WFMainCondition;
import com.grash.utils.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestLifecycleService {

    private final UserService userService;
    private final NotificationService notificationService;
    private final MessageSource messageSource;
    private final WorkflowService workflowService;
    private final MailServiceFactory mailServiceFactory;

    @Value("${frontend.url}")
    private String frontendUrl;

    public void onRequestCreation(Request createdRequest, Company company, String requesterName) {
        String title = messageSource.getMessage("new_request", null, Helper.getLocale(company));
        String message = messageSource.getMessage("notification_new_request", null, Helper.getLocale(company));
        List<OwnUser> usersToNotify = userService.findByCompany(company.getId()).stream()
                .filter(user1 -> user1.isEnabled() && user1.getRole().getViewPermissions().contains(PermissionEntity.SETTINGS)
                        || user1.getRole().getCode().equals(RoleCode.LIMITED_ADMIN)).collect(Collectors.toList());
        notificationService.createMultiple(usersToNotify
                .stream().map(user1 -> new Notification(message, user1, NotificationType.REQUEST,
                        createdRequest.getId())).collect(Collectors.toList()), true, title);
        Map<String, Object> mailVariables = new HashMap<String, Object>() {{
            put("requestLink", frontendUrl + "/app/requests/" + createdRequest.getId());
            put("requestTitle", createdRequest.getTitle());
            put("requester", requesterName);
        }};
        mailServiceFactory.getMailService().sendMessageUsingThymeleafTemplate(usersToNotify.stream().map(OwnUser::getEmail)
                .toArray(String[]::new), messageSource.getMessage("new_request", null,
                Helper.getLocale(company)), mailVariables, "new-request.html", Helper.getLocale(company), null);

        Collection<Workflow> workflows =
                workflowService.findByMainConditionAndCompany(WFMainCondition.REQUEST_CREATED,
                        company.getId());
        workflows.forEach(workflow -> workflowService.runRequest(workflow, createdRequest));
    }
}
