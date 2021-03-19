using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace NewWebAPIDemo.Models
{
    //Klasa za dodavanje kolona AspNetUsers Tabeli
    public class ApplicationUser : IdentityUser
    {
        [Column(TypeName ="nvarchar(150)")]
        public string FullName { get; set; }
        [Column(TypeName = "nvarchar(256)")]
        public string RefreshToken { get; set; }
        public DateTime RefreshTokenExiryTime { get; set; }
    }
}
