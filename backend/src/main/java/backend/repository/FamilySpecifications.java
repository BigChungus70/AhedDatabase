package backend.repository;

import backend.model.Children;
import backend.model.Family;
import backend.model.enums.ArchiveOption;
import backend.model.enums.DataStatus;
import backend.model.enums.FamilyCondition;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Year;
import java.util.Arrays;
import java.util.List;

public class FamilySpecifications {

    // Only apply if the boolean is true
    public static Specification<Family> hasCodeStartingWithLowercase(boolean applyFilter) {
        return (root, query, cb) -> {
            if (!applyFilter) {
                return cb.conjunction();
            }


            Expression<String> code = root.get("code");
            Expression<Integer> codeLength = cb.length(code);
            Expression<String> firstChar = cb.substring(code, 1, 1);
            Expression<String> firstCharLower = cb.lower(firstChar);

            return cb.and(
                    cb.isNotNull(code),
                    cb.greaterThan(codeLength, 0),
                    cb.equal(firstChar, firstCharLower)
            );
        };
    }

    // Handle multiple conditions
    public static Specification<Family> hasConditionIn(List<FamilyCondition> conditions) {
        return (root, query, cb) -> {
            if (conditions == null || conditions.isEmpty()) {
                return cb.conjunction();
            }
            return root.get("condition").in(conditions);
        };
    }

    // Multiple areas
    public static Specification<Family> hasAreaIn(List<String> areas) {
        return (root, query, cb) -> {
            if (areas == null || areas.isEmpty()) {
                return cb.conjunction();
            }
            return root.get("areaName").in(areas);
        };
    }

    // Children age range
    public static Specification<Family> hasChildrenInAgeRange(Integer minAge, Integer maxAge) {
        return (root, query, cb) -> {
            if (minAge == null && maxAge == null) {
                return cb.conjunction();
            }

            Join<Family, Children> children = root.join("children", JoinType.INNER);
            Expression<Integer> currentYear = cb.literal(Year.now().getValue());
            Expression<Integer> childAge = cb.diff(currentYear, children.get("yearOfBirth"));

            query.distinct(true);

            if (minAge != null && maxAge != null) {
                return cb.between(childAge, minAge, maxAge);
            } else if (minAge != null) {
                return cb.greaterThanOrEqualTo(childAge, minAge);
            } else {
                return cb.lessThanOrEqualTo(childAge, maxAge);
            }
        };
    }

    public static Specification<Family> archiveOption(ArchiveOption option) {
        return (root, query, cb) -> {
            if (option == null || option == ArchiveOption.All) {
                return cb.conjunction(); // no filtering
            } else if (option == ArchiveOption.Archived) {
                return root.get("dataStatus").in(DataStatus.ARCHIVED_STATUSES);
            } else { // EXCLUDE
                return cb.not(root.get("dataStatus").in(DataStatus.ARCHIVED_STATUSES));
            }
        };
    }


    // show only priority statuses:
    public static Specification<Family> priorityOnly(boolean priorityOnly) {
        return (root, query, cb) -> {
            if (!priorityOnly) {
                return cb.conjunction();
            }
            return cb.equal(root.get("dataStatus"), DataStatus.priority);
        };
    }

    // just text search in 3 columns
    public static Specification<Family> hasTextInAnyField(String searchText) {
        return (root, query, cb) -> {
            if (searchText == null || searchText.isBlank()) {
                return cb.conjunction();
            }

            // split by +, trim spaces
            String[] terms = searchText.toLowerCase().split("\\+");
            Predicate[] termPredicates = Arrays.stream(terms)
                    .map(String::trim)
                    .filter(t -> !t.isEmpty())
                    .map(term -> cb.or(
                            cb.like(cb.lower(root.get("code")), "%" + term + "%"),
                            cb.like(cb.lower(root.get("address")), "%" + term + "%"),
                            cb.like(cb.lower(root.get("parents")), "%" + term + "%")
                    ))
                    .toArray(Predicate[]::new);

            // combine all terms with OR
            return cb.or(termPredicates);
        };
    }


    public static Specification<Family> orderById() {
        return (root, query, cb) -> {
            query.orderBy(cb.asc(root.get("id"))); // DB will order
            return cb.conjunction(); // nothing else to filter
        };
    }

}
