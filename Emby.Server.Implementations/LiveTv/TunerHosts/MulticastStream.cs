﻿using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediaBrowser.Model.Logging;
using MediaBrowser.Model.Net;

namespace Emby.Server.Implementations.LiveTv.TunerHosts
{
    public class MulticastStream
    {
        private readonly ConcurrentDictionary<Guid, QueueStream> _outputStreams = new ConcurrentDictionary<Guid, QueueStream>();
        private const int BufferSize = 81920;
        private readonly ILogger _logger;

        public MulticastStream(ILogger logger)
        {
            _logger = logger;
        }

        public async Task CopyUntilCancelled(Stream source, Action onStarted, CancellationToken cancellationToken)
        {
            byte[] buffer = new byte[BufferSize];

            if (source == null)
            {
                throw new ArgumentNullException("source");
            }

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var bytesRead = source.Read(buffer, 0, buffer.Length);

                if (bytesRead > 0)
                {
                    var allStreams = _outputStreams.ToList();

                    //if (allStreams.Count == 1)
                    //{
                    //    allStreams[0].Value.Write(buffer, 0, bytesRead);
                    //}
                    //else
                    {
                        byte[] copy = new byte[bytesRead];
                        Buffer.BlockCopy(buffer, 0, copy, 0, bytesRead);

                        foreach (var stream in allStreams)
                        {
                            stream.Value.Queue(copy, 0, copy.Length);
                        }
                    }

                    if (onStarted != null)
                    {
                        var onStartedCopy = onStarted;
                        onStarted = null;
                        Task.Run(onStartedCopy);
                    }
                }

                else
                {
                    await Task.Delay(100).ConfigureAwait(false);
                }
            }
        }

        public Task CopyToAsync(Stream stream, CancellationToken cancellationToken)
        {
            var result = new QueueStream(stream, _logger)
            {
                OnFinished = OnFinished
            };

            _outputStreams.TryAdd(result.Id, result);

            result.Start(cancellationToken);

            return result.TaskCompletion.Task;
        }

        public void RemoveOutputStream(QueueStream stream)
        {
            QueueStream removed;
            _outputStreams.TryRemove(stream.Id, out removed);
        }

        private void OnFinished(QueueStream queueStream)
        {
            RemoveOutputStream(queueStream);
        }
    }
}
