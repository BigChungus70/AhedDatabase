package backend.repository;

import backend.model.Family;
import backend.model.ListEntry;
import backend.model.SavedList;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SavedListRepository extends JpaRepository<SavedList, Long> {

    @Query("SELECT COUNT(L) FROM SavedList L where L.archived != true")
    Long getAllSavedListCount();

    @Query("SELECT e FROM ListEntry e WHERE  e.id = :entryId")
    Optional<ListEntry> findEntryById(@Param("entryId") Long entryId);

    @Query("SELECT COUNT(L) FROM ListEntry L WHERE L.savedList.id = :listId")
    Integer familiesCount(@Param("listId") Long listId);

    @Query("SELECT COUNT(L) FROM ListEntry L WHERE L.savedList.id = :listId AND L.done = TRUE ")
    Integer doneFamiliesCount(@Param("listId") Long listId);

    @EntityGraph(attributePaths = {"entries", "entries.family"})
    Optional<SavedList> findWithEntriesById(Long id);

    @Query("select e from ListEntry e where e.savedList.id = :listId and e.family.id = :familyId")
    Optional<ListEntry> findEntryByListAndFamilyId(Long listId, Long familyId);


    @Query("select f.id, l.name " +
            "from ListEntry e join e.savedList l join e.family f " +
            "where f in :families and e.savedList.archived != true")
    List<Object[]> findListNamesPerFamily(@Param("families") Collection<Family> families);
}
