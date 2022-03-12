﻿using MastersOfCinema.Data;
using MastersOfCinema.Data.Entities;
using MastersOfCinema.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace MastersOfCinema.Controllers
{
    public class AccountController : Controller
    {
        private readonly ICinemaRepository _repository;
        private readonly Context _context;
        private readonly ILogger<AccountController> _logger;
        private readonly SignInManager<User> _signInManager;
        private readonly IHttpContextAccessor _userId;

        public AccountController(IHttpContextAccessor httpContextAccessor,
            ICinemaRepository repository, Context context, ILogger<AccountController> logger, SignInManager<User> signInManager)
        {
            _repository = repository;
            _context = context;
            _logger = logger;
            _signInManager = signInManager;
            _userId = httpContextAccessor;
        }
        public IActionResult Login()
        {
            if (this.User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Director");
            }

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (ModelState.IsValid)
            {

                var result = await _signInManager.PasswordSignInAsync(model.Username,
                  model.Password,
                  model.RememberMe,
                  false);

                if (result.Succeeded)
                {
                    if (Request.Query.Keys.Contains("ReturnUrl"))
                    {
                        return Redirect(Request.Query["ReturnUrl"].First());
                    }
                    else
                    {
                        return RedirectToAction("Profile");
                    }
                }
            }
                ModelState.AddModelError("", "Failed to login");

            return View();
        }


        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Index", "App");
        }

        //to be fixed
        public IActionResult Profile()
        {
            var id = _userId.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            User user = _context.Users.Where(i => i.Id == id).FirstOrDefault();
            var watchList = new ProfileViewModel()
            {
                Movies = _repository.GetWatchlist(),
                Directors = _repository.GetAllDirectors(),
                CurrentUser = user
            };

            return View(watchList);
        }
        public ActionResult Watchlist(int? pageNum)
        {
            var id = _userId.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            User user = _context.Users.Where(i => i.Id == id).FirstOrDefault();
            MovieListViewModel watchList = new MovieListViewModel()
            {
                Movies = _repository.GetWatchlist(),
                //Directors = _repository.GetAllDirectors(),
                CurrentUser = user,
                IsFirstPage = false
            };

            watchList.listCount = watchList.Movies.Count();

            int itemsPerPage = 15;
            //page number (starts from 0)
            pageNum = pageNum ?? 0;

            //first time it's not ajax, next times it is
            bool isAjaxCall = HttpContext.Request.Headers["x-requested-with"] == "XMLHttpRequest";

            if (isAjaxCall)
            {
                var newItems = _repository.GetMovieListForAjax(pageNum.Value, itemsPerPage, watchList.Movies);
                watchList.Movies = newItems;

                return PartialView("Lists/_AjaxMovieListPartial", watchList);
            }
            else
            {
                watchList.IsFirstPage = true;
                int pageCount = (watchList.Movies.ToList().Count() - 1) / itemsPerPage + 1;
                ViewBag.pageCount = pageCount;
                var movies = _repository.GetMovieListForAjax(pageNum.Value, itemsPerPage, watchList.Movies);
                watchList.Movies = movies;
                return View("Watchlist", watchList);
            }

        }

        public ActionResult Films(int? pageNum)
        {
            int itemsPerPage = 15;
            //page number (starts from 0)
            pageNum = pageNum ?? 0;

            var id = _userId.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            User user = _context.Users.Where(i => i.Id == id).FirstOrDefault();
            MovieListViewModel films = new MovieListViewModel()
            {
                Movies = _repository.GetFilms(),
                //Directors = _repository.GetAllDirectors(),
                CurrentUser = user,
                IsFirstPage = false
            };
            films.listCount = films.Movies.Count();

            

            //first time it's not ajax, next times it is
            bool isAjaxCall = HttpContext.Request.Headers["x-requested-with"] == "XMLHttpRequest";

            if (isAjaxCall)
            {
                
                var movies = _repository.GetMovieListForAjax(pageNum.Value, itemsPerPage, films.Movies);
                films.Movies = movies;
                return PartialView("Lists/_AjaxMovieListPartial", films);
            }
            else
            {
                films.IsFirstPage = true;

                int pageCount = (films.Movies.ToList().Count() - 1) / itemsPerPage + 1;
                ViewBag.pageCount = pageCount;
                var movies = _repository.GetMovieListForAjax(pageNum.Value, itemsPerPage, films.Movies);
                films.Movies = movies;
                return View("Films", films);
            }
        }


        //Films user has rated listed
        public IActionResult Ratings(int? pageNum)
        {
            var id = _userId.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            User user = _context.Users.Where(i => i.Id == id).FirstOrDefault();
            MovieListViewModel ratedMovies = new MovieListViewModel()
            {
                Movies = _repository.GetRatings(),
                //Directors = _repository.GetAllDirectors(),
                CurrentUser = user,
                IsFirstPage = false
            };

            ratedMovies.listCount = ratedMovies.Movies.Count();

            int itemsPerPage = 15;
            //page number (starts from 0)
            pageNum = pageNum ?? 0;

            //first time it's not ajax, next times it is
            bool isAjaxCall = HttpContext.Request.Headers["x-requested-with"] == "XMLHttpRequest";

            if (isAjaxCall)
            {
                var newItems = _repository.GetMovieListForAjax(pageNum.Value, itemsPerPage, ratedMovies.Movies);
                ratedMovies.Movies = newItems;

                return PartialView("Lists/_AjaxMovieListPartial", ratedMovies);
            }
            else
            {
                ratedMovies.IsFirstPage = true;
                int pageCount = (ratedMovies.Movies.ToList().Count() - 1) / itemsPerPage + 1;
                ViewBag.pageCount = pageCount;
                var movies = _repository.GetMovieListForAjax(pageNum.Value, itemsPerPage, ratedMovies.Movies);
                ratedMovies.Movies = movies;
                return View("Ratings", ratedMovies);
            }
        }

        //Displays all of the custom lists of the user!
        public ActionResult CLists(int? pageNum)
        {
            var id = _userId.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            User user = _context.Users.Where(i => i.Id == id).FirstOrDefault();
            CListsViewModel customList = new CListsViewModel()
            {

                Lists = _repository.GetListsList(),
                User = user,
                IsFirstPage = false
            };
            int itemsPerPage = 3;
            pageNum = pageNum ?? 0;

            customList.listCount = customList.Lists.Count();
            
            //first time it's not ajax, next times it is
            bool isAjaxCall = HttpContext.Request.Headers["x-requested-with"] == "XMLHttpRequest";

            if (isAjaxCall)
            {
                var newItems = _repository.GetListsListForAjax(pageNum.Value, itemsPerPage, customList.Lists);
                customList.Lists = newItems;
                return PartialView("Lists/_CListPartial", customList);
            }
            else
            {
                customList.IsFirstPage = true;

                int pageCount = (customList.Lists.ToList().Count() - 1) / itemsPerPage + 1;

                ViewBag.pageCount = pageCount;

                var newItems = _repository.GetListsListForAjax(pageNum.Value, itemsPerPage, customList.Lists);
                customList.Lists = newItems;
                return View("CLists", customList);
            }
        }

        //Displays a custom list!
        public ActionResult CList(int? id, int? pageNum)
        {
            if (id == null)
            {
                return NotFound();
            }

            var userId = _userId.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value;
            User user = _context.Users.Where(i => i.Id == userId).FirstOrDefault();

            MovieListViewModel customList = new MovieListViewModel()
            {
                Movies = _repository.GetCustomList(id.Value),
                Title = _repository.GetListTitle(id.Value),
                Description = _repository.GetListDescription(id.Value),
                //Directors = _repository.GetAllDirectors(),
                CurrentUser = user,
                IsFirstPage = false
            };

            customList.listCount = customList.Movies.Count();

            int itemsPerPage = 15;
            //page number (starts from 0)
            pageNum = pageNum ?? 0;

            //first time it's not ajax, next times it is
            bool isAjaxCall = HttpContext.Request.Headers["x-requested-with"] == "XMLHttpRequest";

            if (isAjaxCall)
            {
                var newItems = _repository.GetMovieListForAjax(pageNum.Value, itemsPerPage, customList.Movies);
                customList.Movies = newItems;

                return PartialView("Lists/_AjaxMovieListPartial", customList);
            }
            else
            {
                customList.IsFirstPage = true;
                int pageCount = (customList.Movies.ToList().Count() - 1) / itemsPerPage + 1;
                ViewBag.pageCount = pageCount;
                ViewBag.listId = id.ToString();
                var movies = _repository.GetMovieListForAjax(pageNum.Value, itemsPerPage, customList.Movies);
                customList.Movies = movies;
                return View("CList", customList);
            }

        }

        //Displays a custom list!
        
        //Begin Create Custom list 
        [HttpGet]
        public ActionResult AddList()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddList(AddListViewModel newList)
        {





            if (ModelState.IsValid)
            {

                /*string fileName;

                if (directorViewModel.ImageFile == null)
                {
                    //If image not uploaded, assign the default photo
                    fileName = "DirectorsDefaultImage.jpg";
                    directorViewModel.ImageName = fileName;
                }*/
                /*else
                {
                    //If image uploaded, Save image to wwwroot/image
                    string wwwRootPath = _hostEnvironment.WebRootPath;
                    fileName = Path.GetFileNameWithoutExtension(directorViewModel.ImageFile.FileName);
                    string extension = Path.GetExtension(directorViewModel.ImageFile.FileName);
                    directorViewModel.ImageName = fileName = fileName + DateTime.Now.ToString("yymmssfff") + extension;
                    var path = Path.Combine(wwwRootPath + "/Image/", fileName);
                    using (var fileStream = new FileStream(path, FileMode.Create))
                    {
                        await directorViewModel.ImageFile.CopyToAsync(fileStream);
                    }
                }*/
                var UserName = HttpContext.User.Identity.Name;

                var viewModelObject = new CList
                {
                    
                    Title = newList.Title,
                    Description =newList.Description,

                    User = _context.Users.FirstOrDefault(u => u.UserName == UserName)
                };

                //Insert record
                _context.Add(viewModelObject);
                await _context.SaveChangesAsync();


                var viewModelMovie = new ListMovies
                {

                    MovieId = newList.MovieId[0],
                    CListId = _context.Lists.Where(x => x.User.UserName == HttpContext.User.Identity.Name).OrderByDescending(x => x.Id).FirstOrDefault().Id
                };
                //Insert record
                _context.Add(viewModelMovie);
                await _context.SaveChangesAsync();

                return RedirectToAction(nameof(CLists));
            }
            return View(newList);
        }
    }
}
