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
        private const string MBValidateUrl = "https://mb3admin.com/admin/service/registration/validate";
        private const string AppstoreRegUrl = /*MbAdmin.HttpsUrl*/ "https://mb3admin.com/admin/service/appstore/register";

        public async Task<bool> IsSupporter()
        {
            var result = await GetRegistrationStatus("MBSupporter", _appHost.ApplicationVersion.ToString()).ConfigureAwait(false);

            return result.IsRegistered;
        }

        private MBLicenseFile _licenseFile;
        private MBLicenseFile LicenseFile
        {
            get { return _licenseFile ?? (_licenseFile = new MBLicenseFile(_appPaths, _fileSystem, _cryptographyProvider)); }
        }

        private readonly IHttpClient _httpClient;
        private readonly IJsonSerializer _jsonSerializer;
        private readonly IServerApplicationHost _appHost;
        private readonly ILogger _logger;
        private readonly IApplicationPaths _appPaths;
        private readonly IFileSystem _fileSystem;
        private readonly ICryptoProvider _cryptographyProvider;

        /// <summary>
        /// Initializes a new instance of the <see cref="PluginSecurityManager" /> class.
        /// </summary>
        public PluginSecurityManager(IServerApplicationHost appHost, IHttpClient httpClient, IJsonSerializer jsonSerializer,
            IApplicationPaths appPaths, ILogManager logManager, IFileSystem fileSystem, ICryptoProvider cryptographyProvider)
        {
            if (httpClient == null)
            {
                throw new ArgumentNullException("httpClient");
            }

            _appHost = appHost;
            _httpClient = httpClient;
            _jsonSerializer = jsonSerializer;
            _appPaths = appPaths;
            _fileSystem = fileSystem;
            _cryptographyProvider = cryptographyProvider;
            _logger = logManager.GetLogger("SecurityManager");
        }

        /// <summary>
        /// Gets the registration status.
        /// This overload supports existing plug-ins.
        /// </summary>
        public Task<MBRegistrationRecord> GetRegistrationStatus(string feature)
        {
            return GetRegistrationStatus(feature, null);
        }

        private SemaphoreSlim _regCheckLock = new SemaphoreSlim(1, 1);
        /// <summary>
        /// Gets the registration status.
        /// </summary>
        public async Task<MBRegistrationRecord> GetRegistrationStatus(string feature, string version)
        {
            await _regCheckLock.WaitAsync(CancellationToken.None).ConfigureAwait(false);

            try
            {
                return await GetRegistrationStatusInternal(feature, version).ConfigureAwait(false);
            }
            finally
            {
                _regCheckLock.Release();
            }
        }

        /// <summary>
        /// Gets or sets the supporter key.
        /// </summary>
        /// <value>The supporter key.</value>
        public string SupporterKey
        {
            get
            {
                return LicenseFile.RegKey;
            }
            set
            {
                throw new Exception("Please call UpdateSupporterKey");
            }
        }

        public async Task UpdateSupporterKey(string newValue)
        {
            if (newValue != null)
            {
                newValue = newValue.Trim();
            }

            if (!string.Equals(newValue, LicenseFile.RegKey, StringComparison.Ordinal))
            {
                LicenseFile.RegKey = newValue;
                LicenseFile.Save();

                // Reset this
                await IsSupporter().ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Register an app store sale with our back-end.  It will validate the transaction with the store
        /// and then register the proper feature and then fill in the supporter key on success.
        /// </summary>
        /// <param name="parameters">Json parameters to send to admin server</param>
        public async Task RegisterAppStoreSale(string parameters)
        {
            var options = new HttpRequestOptions()
            {
                Url = AppstoreRegUrl,
                CancellationToken = CancellationToken.None,
                BufferContent = false
            };
            options.RequestHeaders.Add("X-Emby-Token", _appHost.SystemId);
            options.RequestContent = parameters;
            options.RequestContentType = "application/json";

            try
            {
                using (var response = await _httpClient.Post(options).ConfigureAwait(false))
                {
                    var reg = _jsonSerializer.DeserializeFromStream<RegRecord>(response.Content);

                    if (reg == null)
                    {
                        var msg = "Result from appstore registration was null.";
                        _logger.Error(msg);
                        throw new ArgumentException(msg);
                    }
                    if (!String.IsNullOrEmpty(reg.key))
                    {
                        await UpdateSupporterKey(reg.key).ConfigureAwait(false);
                    }
                }

            }
            catch (ArgumentException)
            {
                SaveAppStoreInfo(parameters);
                throw;
            }
            catch (HttpException e)
            {
                _logger.ErrorException("Error registering appstore purchase {0}", e, parameters ?? "NO PARMS SENT");

                if (e.StatusCode.HasValue && e.StatusCode.Value == HttpStatusCode.PaymentRequired)
                {
                }
                throw new Exception("Error registering store sale");
            }
            catch (Exception e)
            {
                _logger.ErrorException("Error registering appstore purchase {0}", e, parameters ?? "NO PARMS SENT");
                SaveAppStoreInfo(parameters);
                //TODO - could create a re-try routine on start-up if this file is there.  For now we can handle manually.
                throw new Exception("Error registering store sale");
            }

        }

        private void SaveAppStoreInfo(string info)
        {
            // Save all transaction information to a file

            try
            {
                _fileSystem.WriteAllText(Path.Combine(_appPaths.ProgramDataPath, "apptrans-error.txt"), info);
            }
            catch (IOException)
            {

            }
        }

        private async Task<MBRegistrationRecord> GetRegistrationStatusInternal(string feature,
            string version = null)
        {
            var record = new MBRegistrationRecord
            {
                IsRegistered = true,
                RegChecked = true,
                TrialVersion = false,
                IsValid = true,
                RegError = false
            };

            return record;
        }

        private bool IsInTrial(DateTime expirationDate, bool regChecked, bool isRegistered)
        {
            //don't set this until we've successfully obtained exp date
            if (!regChecked)
            {
                return false;
            }

            var isInTrial = expirationDate > DateTime.UtcNow;

            return isInTrial && !isRegistered;
        }
    }
}
