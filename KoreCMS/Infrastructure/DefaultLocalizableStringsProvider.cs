﻿using System.Collections.Generic;
using Kore.Localization;

namespace KoreCMS.Infrastructure
{
    public class DefaultLocalizableStringsProvider : IDefaultLocalizableStringsProvider
    {
        #region IDefaultLocalizableStringsProvider Members

        public ICollection<Translation> GetTranslations()
        {
            return new[]
            {
                new Translation
                {
                    CultureCode = null,
                    LocalizedStrings = new Dictionary<string, string>
                    {
                        { LocalizableStrings.Dashboard.Title, "Dashboard" },
                    }
                }
            };
        }

        #endregion IDefaultLocalizableStringsProvider Members
    }
}