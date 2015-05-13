﻿using Kore.Infrastructure;
using Kore.Web.Configuration;
namespace Kore.Web
{
    public static class KoreWebConstants
    {
        private static string defaultAdminLayoutPath = "~/Areas/Admin/Views/Shared/_Layout.cshtml";
        public static string DefaultAdminLayoutPath
        {
            get
            {
                if (string.IsNullOrEmpty(defaultAdminLayoutPath))
                {
                    var siteSettings = EngineContext.Current.Resolve<KoreSiteSettings>();

                    string adminLayoutPath = string.IsNullOrEmpty(siteSettings.AdminLayoutPath)
                        ? "~/Areas/Admin/Views/Shared/_Layout.cshtml"
                        : siteSettings.AdminLayoutPath;
                }
                return defaultAdminLayoutPath;
            }
        }

        public static class Areas
        {
            public const string Configuration = "Admin/Configuration";
            public const string Indexing = "Admin/Indexing";
            public const string Plugins = "Admin/Plugins";
            public const string ScheduledTasks = "Admin/ScheduledTasks";
        }

        public static class CacheKeys
        {
        }

        public static class Indexing
        {
            public const string DefaultIndexName = "Search";
        }

        //public static class Features
        //{
        //    public const string Media = "Kore.ContentManagement.Media";
        //}

        public static class StateProviders
        {
            public const string CurrentCultureCode = "CurrentCultureCode";
            public const string CurrentDesktopTheme = "CurrentDesktopTheme";
            public const string CurrentMobileTheme = "CurrentMobileTheme";
            public const string CurrentUser = "CurrentUser";
        }
    }
}