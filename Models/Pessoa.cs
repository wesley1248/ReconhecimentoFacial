using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Pgvector;

namespace ReconhecimentoFacial.Models
{
    public class Pessoa
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nome { get; set; }

        [Column(TypeName = "vector(128)")]
        public Vector Embedding { get; set; }

        public Pessoa()
        {
            Nome = string.Empty;
            Embedding = new Vector(new float[128]);
        }
    }
}
