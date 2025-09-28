package backend.repository;

import backend.model.Family;
import backend.model.enums.DataStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamilyRepository extends
        JpaRepository<Family, Long>, JpaSpecificationExecutor<Family> {

    @Query("SELECT f FROM Family f ORDER BY f.sequence")
    Optional<List<Family>> getAllFamilies();

    Optional<List<Family>> findByCodeIn(List<String> codes);

    Optional<Family> findByCode(String code);

    @Query("SELECT COUNT(f) FROM Family f")
    Long getAllFamiliesCount();

    @Query("SELECT COUNT(f) FROM Family f WHERE f.dataStatus NOT IN :archivedStatuses")
    Long getAllNonArchivedFamiliesCount(@Param("archivedStatuses") List<DataStatus> archivedStatuses);

    @Query("SELECT f FROM Family f where f.code = :code")
    Family getFamilyByCode(@Param("code") String code);

    @Query("SELECT MAX(CAST(SUBSTRING(f.code, 4, 3) AS int)) FROM Family f")
    Integer findMaxSequence();

}
