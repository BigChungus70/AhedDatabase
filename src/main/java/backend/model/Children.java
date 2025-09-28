package backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import java.time.LocalDate;

@Entity
@Table(

        name = "children",
        uniqueConstraints = @UniqueConstraint(columnNames = {"family_code", "name", "year_of_birth"}, name = "uq_child")
)

@Getter
@Setter
@Audited
@NoArgsConstructor
@AllArgsConstructor
public class Children {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "year_of_birth", nullable = false)
    private Integer yearOfBirth;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_code", referencedColumnName = "code", nullable = false)
    @JsonIgnore
    @NotAudited //phantom auditing
    private Family family;


    public int getCurrentAge() {
        return LocalDate.now().getYear() - yearOfBirth;
    }

}
