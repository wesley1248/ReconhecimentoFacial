using Microsoft.AspNetCore.Mvc;

namespace ReconhecimentoFacial.Controllers
{
    public class FaceController : Controller
    {
        public IActionResult Index()
        {
            return View("Index");
        }

        public IActionResult Identificar()
        {
            return View();
        }

        public IActionResult Cadastrar()
        {
            return View();
        }
    }
}
