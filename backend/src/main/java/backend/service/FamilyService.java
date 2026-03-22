package backend.service;

import backend.model.Children;
import backend.model.Family;
import backend.model.enums.ArchiveOption;
import backend.model.enums.DataStatus;
import backend.model.enums.FamilyCondition;
import backend.repository.FamilyRepository;
import backend.repository.FamilySpecifications;
import backend.repository.SavedListRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class FamilyService {

    private final FamilyRepository familyRepo;
    private final ChildrenService childrenService;
    private final SavedListRepository listRepo;

    public List<Family> getAllFamilies() {
        return familyRepo.getAllFamilies()
                .orElseThrow(RuntimeException::new);
    }

    public Family getFamily(String code) {
        return familyRepo.getFamilyByCode(code);
    }

    private List<Family> filterFamilies(boolean filterByLowercaseFirstLetter,
                                        List<FamilyCondition> conditions,
                                        List<String> areas,
                                        Integer minAge,
                                        Integer maxAge,
                                        ArchiveOption archiveOption,
                                        boolean priorityOnly,
                                        String searchText) {

        if (minAge != null && minAge < 0)
            minAge = Math.abs(minAge);
        if (maxAge != null && maxAge < 0)
            maxAge = Math.abs(maxAge);

        Specification<Family> spec = Specification.allOf(
                FamilySpecifications.hasConditionIn(conditions),
                FamilySpecifications.hasCodeStartingWithLowercase(filterByLowercaseFirstLetter),
                FamilySpecifications.hasAreaIn(areas),
                FamilySpecifications.hasChildrenInAgeRange(minAge, maxAge),
                FamilySpecifications.archiveOption(archiveOption),
                FamilySpecifications.priorityOnly(priorityOnly),
                FamilySpecifications.hasTextInAnyField(searchText),
                FamilySpecifications.orderById()
        );

        return familyRepo.findAll(spec);
    }

    @Transactional(readOnly = true)
    public List<Family> searchFamilies(
            boolean filterByLowercaseFirstLetter,
            List<FamilyCondition> conditions,
            List<String> areas,
            Integer minAge,
            Integer maxAge,
            ArchiveOption archiveOption,
            boolean priorityOnly,
            String searchText) {

        List<Family> families = filterFamilies(
                filterByLowercaseFirstLetter,
                conditions, areas, minAge, maxAge,
                archiveOption, priorityOnly, searchText);

        Map<Long, List<String>> map =
                listRepo.findListNamesPerFamily(families)
                        .stream()
                        .collect(Collectors.groupingBy(
                                arr -> (Long) arr[0],
                                Collectors.mapping(arr -> (String) arr[1], Collectors.toList())));

        families.forEach(f -> {
            f.setContainingLists(map.getOrDefault(f.getId(), List.of()));
            if (minAge != null || maxAge != null) {
                f.setChildrenCount((int) f.getChildren().stream().mapToInt(Children::getCurrentAge).
                        filter(a -> (minAge == null || a >= minAge) && (maxAge == null || a <= maxAge)).count());
            }
        });
        return families;
    }

    public Long getAllFamiliesCount() {
        return familyRepo.getAllFamiliesCount();
    }

    public Long getAllNonArchivedFamiliesCount() {
        return familyRepo.getAllNonArchivedFamiliesCount(DataStatus.ARCHIVED_STATUSES);
    }

    public Family updateFamily(Family family) {
        Family existing = familyRepo.findById(family.getId())
                .orElseThrow(() -> new RuntimeException("Family not found"));

        // copy fields except ID and children
        org.springframework.beans.BeanUtils.copyProperties(family, existing, "id", "children");

        // handle children separately
        if (family.getChildren() != null) {
            childrenService.updateChildrenForFamily(existing.getCode(), family.getChildren());
        }

        existing.setDataUpdate(java.time.LocalDateTime.now().toString());

        return familyRepo.save(existing);
    }


    public Family saveFamily(Family family) {
        String code = family.getCode();

        if (code == null || code.length() < 3) {
            throw new IllegalArgumentException("Invalid family code: " + code);
        }

        // Extract the user-provided parts
        String letter = code.substring(0, 1);
        String digits = code.substring(1, 3);

        // Find the max sequence from DB (ignoring letter+digits)
        Integer maxSeq = familyRepo.findMaxSequence();
        int nextSeq = (maxSeq == null) ? 1 : maxSeq + 1;

        // Pad to 3 digits (or 4 if you later expand)
        String paddedSeq = String.format("%03d", nextSeq);

        // Construct final code
        String finalCode = letter + digits + paddedSeq;
        family.setCode(finalCode);

        family.setDataUpdate(java.time.LocalDateTime.now().toString());
        List<Children> childrenList = family.getChildren();
        family.setChildren(null);

        Family savedFamily = familyRepo.save(family);

        if (!childrenList.isEmpty()) {
            childrenService.addChildrenForFamily(savedFamily, childrenList);
        }

        return savedFamily;
    }


    public Family deleteFamily(String code) {
        Family savedFamily = familyRepo.findByCode(code)
                .orElseThrow(() -> new EntityNotFoundException("Family not found"));
        familyRepo.delete(savedFamily);
        return savedFamily;
    }

}
