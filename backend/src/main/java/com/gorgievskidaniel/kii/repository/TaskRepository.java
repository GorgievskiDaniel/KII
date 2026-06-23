package com.gorgievskidaniel.kii.repository;

import com.gorgievskidaniel.kii.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends PagingAndSortingRepository<Task, Long> {

    @Query("select t from Task t where (:status is null or :status = '' or upper(t.status) = upper(:status)) and (:query is null or :query = '' or (upper(t.title) like concat('%', upper(:query), '%') or upper(t.description) like concat('%', upper(:query), '%'))) ")
    Page<Task> search(@Param("status") String status, @Param("query") String query, Pageable pageable);
}