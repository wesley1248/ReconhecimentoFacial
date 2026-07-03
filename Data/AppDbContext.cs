using Microsoft.EntityFrameworkCore;
using ReconhecimentoFacial.Models;

namespace ReconhecimentoFacial.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Pessoa> Pessoas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
             
            modelBuilder.HasPostgresExtension("vector");
        }
    }
}
