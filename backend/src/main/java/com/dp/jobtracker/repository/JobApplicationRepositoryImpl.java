package com.dp.jobtracker.repository;

import com.dp.jobtracker.model.entity.JobApplication;
import com.dp.jobtracker.model.enumeration.JobStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.ParameterExpression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Repository
public class JobApplicationRepositoryImpl implements JobApplicationRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<JobApplication> search(Long userId,
                                       JobStatus status,
                                       String companyName,
                                       String title,
                                       LocalDate applicationDateFrom,
                                       LocalDate applicationDateTo,
                                       Pageable pageable) {

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        ParameterExpression<String> companyNamePattern = cb.parameter(String.class, "companyNamePattern");
        ParameterExpression<String> titlePattern = cb.parameter(String.class, "titlePattern");

        CriteriaQuery<JobApplication> cq = cb.createQuery(JobApplication.class);
        Root<JobApplication> root = cq.from(JobApplication.class);
        List<Predicate> predicates = buildPredicates(cb, root, userId, status, companyName, title, applicationDateFrom, applicationDateTo, companyNamePattern, titlePattern);
        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(cb.desc(root.get("lastUpdateDate")), cb.desc(root.get("applicationDate")));

        TypedQuery<JobApplication> query = entityManager.createQuery(cq);
        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());
        setLikeParameters(query, companyName, title);
        List<JobApplication> resultList = query.getResultList();

        CriteriaQuery<Long> countCq = cb.createQuery(Long.class);
        Root<JobApplication> countRoot = countCq.from(JobApplication.class);
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, userId, status, companyName, title, applicationDateFrom, applicationDateTo, companyNamePattern, titlePattern);
        countCq.select(cb.count(countRoot));
        countCq.where(countPredicates.toArray(new Predicate[0]));
        TypedQuery<Long> countQuery = entityManager.createQuery(countCq);
        setLikeParameters(countQuery, companyName, title);
        Long total = countQuery.getSingleResult();

        return new PageImpl<>(resultList, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb,
                                            Root<JobApplication> root,
                                            Long userId,
                                            JobStatus status,
                                            String companyName,
                                            String title,
                                            LocalDate applicationDateFrom,
                                            LocalDate applicationDateTo,
                                            ParameterExpression<String> companyNamePattern,
                                            ParameterExpression<String> titlePattern) {
        List<Predicate> predicates = new ArrayList<>();

        if (userId != null) {
            predicates.add(cb.equal(root.get("user").get("id"), userId));
        }
        if (status != null) {
            predicates.add(cb.equal(root.get("status"), status));
        }
        if (companyName != null && !companyName.isBlank()) {
            predicates.add(cb.like(cb.lower(root.get("companyName")), companyNamePattern, '\\'));
        }
        if (title != null && !title.isBlank()) {
            predicates.add(cb.like(cb.lower(root.get("title")), titlePattern, '\\'));
        }
        if (applicationDateFrom != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("applicationDate"), applicationDateFrom));
        }
        if (applicationDateTo != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("applicationDate"), applicationDateTo));
        }
        return predicates;
    }

    private void setLikeParameters(TypedQuery<?> query, String companyName, String title) {
        if (companyName != null && !companyName.isBlank()) {
            query.setParameter("companyNamePattern", "%" + escapeForLike(companyName.toLowerCase()) + "%");
        }
        if (title != null && !title.isBlank()) {
            query.setParameter("titlePattern", "%" + escapeForLike(title.toLowerCase()) + "%");
        }
    }

    /**
     * Escapes characters that are wildcards in SQL LIKE (% and _) so they are matched literally.
     * Prevents injection and unexpected broad matches.
     */
    private static String escapeForLike(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
}

