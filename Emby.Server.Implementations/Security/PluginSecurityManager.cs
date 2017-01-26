using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Net;
using MediaBrowser.Common.Security;
using MediaBrowser.Controller;
using MediaBrowser.Model.Cryptography;
using MediaBrowser.Model.Entities;
using MediaBrowser.Model.IO;
using MediaBrowser.Model.Logging;
using MediaBrowser.Model.Net;
using MediaBrowser.Model.Serialization;

namespace Emby.Server.Implementations.Security
{
    /// <summary>
    /// Class PluginSecurityManager
    /// </summary>
    public class PluginSecurityManager : ISecurityManager
    {
        /// <summary>
        /// Gets a value indicating whether this instance is MB supporter.
        /// </summary>
        /// <value><c>true</c> if this instance is MB supporter; otherwise, <c>false</c>.</value>
        public bool IsMBSupporter
        {
            get
            {
                return true;
            }
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="PluginSecurityManager" /> class.
        /// </summary>
        public PluginSecurityManager(IServerApplicationHost appHost, IHttpClient httpClient, IJsonSerializer jsonSerializer,
            IApplicationPaths appPaths, ILogManager logManager, IFileSystem fileSystem, ICryptoProvider cryptographyProvider)
        {
        }

        /// <summary>
        /// Load all registration info for all entities that require registration
        /// </summary>
        /// <returns></returns>
        public async Task LoadAllRegistrationInfo()
        {
        }

        /// <summary>
        /// Gets the registration status.
        /// This overload supports existing plug-ins.
        /// </summary>
        /// <param name="feature">The feature.</param>
        /// <param name="mb2Equivalent">The MB2 equivalent.</param>
        /// <returns>Task{MBRegistrationRecord}.</returns>
        public Task<MBRegistrationRecord> GetRegistrationStatus(string feature, string mb2Equivalent = null)
        {
            return GetRegistrationStatusInternal(feature, mb2Equivalent);
        }

        /// <summary>
        /// Gets the registration status.
        /// </summary>
        /// <param name="feature">The feature.</param>
        /// <param name="mb2Equivalent">The MB2 equivalent.</param>
        /// <param name="version">The version of this feature</param>
        /// <returns>Task{MBRegistrationRecord}.</returns>
        public Task<MBRegistrationRecord> GetRegistrationStatus(string feature, string mb2Equivalent, string version)
        {
            return GetRegistrationStatusInternal(feature, mb2Equivalent, version);
        }

        /// <summary>
        /// Gets or sets the supporter key.
        /// </summary>
        /// <value>The supporter key.</value>
        public string SupporterKey
        {
            get
            {
                return "Hello";
            }
            set
            {
            }
        }

        /// <summary>
        /// Register an app store sale with our back-end.  It will validate the transaction with the store
        /// and then register the proper feature and then fill in the supporter key on success.
        /// </summary>
        /// <param name="parameters">Json parameters to send to admin server</param>
        public async Task RegisterAppStoreSale(string parameters)
        {
        }

        private async Task<MBRegistrationRecord> GetRegistrationStatusInternal(string feature,
            string mb2Equivalent = null,
            string version = null)
        {
            var record = new MBRegistrationRecord
            {
                IsRegistered = true,
                ExpirationDate = DateTime.UtcNow.AddYears(10),
                RegChecked = true,
                RegError = false
            };

            record.TrialVersion = false;
            record.IsValid = true;

            return record;
        }
    }
}
