package com.synapseforce.task;

import com.synapseforce.notification.Notification;
import com.synapseforce.notification.NotificationRepository;
import com.synapseforce.project.Project;
import com.synapseforce.project.ProjectRepository;
import com.synapseforce.user.User;
import com.synapseforce.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public TaskResponse create(Long projectId, TaskRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        User assignee = null;
        if (request.getAssignedToUserId() != null) {
            assignee = userRepository.findById(request.getAssignedToUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .project(project)
                .assignedTo(assignee)
                .build();

        Task saved = taskRepository.save(task);

        // Notify the assigned employee
        if (assignee != null) {
            notificationRepository.save(Notification.builder()
                    .userId(assignee.getId())
                    .message("You have been assigned a new task: \"" + task.getTitle()
                            + "\" in project " + project.getName())
                    .build());
        }

        return TaskResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId)
                .stream().map(TaskResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getMyTasks(Long userId) {
        return taskRepository.findByAssignedToId(userId)
                .stream().map(TaskResponse::from).toList();
    }

    public TaskResponse updateStatus(Long taskId, TaskStatus status, String employeeEmail) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        User user = userRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Only the assigned employee or admin can update
        boolean isAdmin = user.getRole() == com.synapseforce.user.Role.ADMIN;
        boolean isAssignee = task.getAssignedTo() != null
                && task.getAssignedTo().getId().equals(user.getId());

        if (!isAdmin && !isAssignee) {
            throw new IllegalArgumentException("Not authorized to update this task");
        }

        task.setStatus(status);
        return TaskResponse.from(taskRepository.save(task));
    }

    public void delete(Long taskId) {
        taskRepository.deleteById(taskId);
    }
}
