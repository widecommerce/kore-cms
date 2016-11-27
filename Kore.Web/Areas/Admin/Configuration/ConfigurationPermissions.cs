﻿using System.Collections.Generic;
using Kore.Web.Security.Membership.Permissions;

namespace Kore.Web.Areas.Admin.Configuration
{
    public class ConfigurationPermissions : IPermissionProvider
    {
        public static readonly Permission ReadSettings = new Permission { Name = "Settings_Read", Category = "Configuration", Description = "Settings: Read" };
        public static readonly Permission ReadThemes = new Permission { Name = "Themes_Read", Category = "Configuration", Description = "Themes: Read" };
        public static readonly Permission WriteSettings = new Permission { Name = "Settings_Write", Category = "Configuration", Description = "Settings: Write" };
        public static readonly Permission WriteThemes = new Permission { Name = "Themes_Write", Category = "Configuration", Description = "Themes: Write" };

        public IEnumerable<Permission> GetPermissions()
        {
            yield return ReadSettings;
            yield return ReadThemes;
            yield return WriteSettings;
            yield return WriteThemes;
        }
    }
}