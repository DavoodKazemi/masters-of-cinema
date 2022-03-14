﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MastersOfCinema.ViewModels
{
    public class AddListViewModel
    {
        public User User { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        //Movies
        public int CListId { get; set; }
        public List<int> MovieId { get; set; }
        //search
        public string SearchTerm { get; set; }
        public List<Movie> resultMovies { get; set; }
        public List<ResultMovie> suggestMovies { get; set; }
    }
}
