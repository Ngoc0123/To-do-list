package com.example.todo.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.todo.dto.TaskResponse;
import com.example.todo.exception.GlobalExceptionHandler;
import com.example.todo.service.TaskService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

@WebMvcTest(TaskController.class)
@Import(GlobalExceptionHandler.class)
class TaskControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @Test
    void getTasksShouldPassPaginationAndSortToService() throws Exception {
        Page<TaskResponse> emptyPage = new PageImpl<>(List.of());
        when(taskService.getTasks(eq("api"), eq(false), eq(null), eq(null), eq(null), eq(null), any(Pageable.class)))
                .thenReturn(emptyPage);

        mockMvc.perform(get("/api/v1/tasks")
                        .param("search", "api")
                        .param("isCompleted", "false")
                        .param("page", "2")
                        .param("size", "5")
                        .param("sort", "dueDate,desc"))
                .andExpect(status().isOk());

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(taskService).getTasks(eq("api"), eq(false), eq(null), eq(null), eq(null), eq(null), pageableCaptor.capture());

        Pageable pageable = pageableCaptor.getValue();
        Sort.Order dueDateOrder = pageable.getSort().getOrderFor("dueDate");
        org.junit.jupiter.api.Assertions.assertEquals(2, pageable.getPageNumber());
        org.junit.jupiter.api.Assertions.assertEquals(5, pageable.getPageSize());
        org.junit.jupiter.api.Assertions.assertNotNull(dueDateOrder);
        org.junit.jupiter.api.Assertions.assertEquals(Sort.Direction.DESC, dueDateOrder.getDirection());
    }

    @Test
    void getTasksWithNegativePageShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/v1/tasks").param("page", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid request parameters"));

        verify(taskService, never()).getTasks(any(), any(), any(), any(), any(), any(), any(Pageable.class));
    }

    @Test
    void getTasksWithUnsupportedSortFieldShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/v1/tasks").param("sort", "unknown,asc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unsupported sort field: unknown"));

        verify(taskService, never()).getTasks(any(), any(), any(), any(), any(), any(), any(Pageable.class));
    }

    @Test
    void getTasksWithUnsupportedSortDirectionShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/v1/tasks").param("sort", "dueDate,sideways"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unsupported sort direction: sideways"));

        verify(taskService, never()).getTasks(any(), any(), any(), any(), any(), any(), any(Pageable.class));
    }
}
