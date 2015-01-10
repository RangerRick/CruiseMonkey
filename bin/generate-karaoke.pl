#!/usr/bin/env perl -w

$|++;

use warnings;
use strict;
use utf8;

use LWP::Simple;
use LWP::UserAgent;
use HTML::TreeBuilder;
use Data::Dumper;
use JSON::PP;

use Store::CouchDB;

my $tree = HTML::TreeBuilder->new();

#print "* connecting to CouchDB... ";
#my $db = Store::CouchDB->new(host => 'localhost', db => 'karaoke');
#print "done\n";
#
#print "* Getting all existing documents... ";
#my $existing = {};
#my $all_docs = $db->all_docs();
#if (defined $all_docs) {
#	for my $doc (@{ $db->all_docs() }) {
#		$existing->{$doc->{'id'}} = 1;
#	}
#}
#print "done\n";

print "* getting Karaoke data... ";
my $content = get 'http://www.infernalsingalongmachine.com/docs/SongCatalogMobile.html';
$tree->parse_content($content);
print "done\n";

my $results = {};

print "* parsing Karaoke data... ";
my @dls = $tree->look_down('_tag', 'dl');

for my $dl (@dls) {
	for my $dt ($dl->look_down('_tag', 'dt')) {
		my $artist = $dt->as_trimmed_text();

		my $dd = $dt->right();
		for my $br ($dd->look_down('_tag', 'br')) {
			$br->replace_with('########');
		}
		my @songs;
		for my $song (split(/\#\#\#\#\#\#\#\#/, $dd->as_trimmed_text())) {
			$song =~ s/^\s*(.*?)\s*$/$1/;
			push(@songs, $song)
		}

		my $lc_artist = lc($artist);

		if (exists $results->{$lc_artist}) {
			push(@{$results->{$lc_artist}->{'songs'}}, @songs);
		} else {
			$results->{$lc_artist} = {
				display_name => $artist,
				songs => \@songs
			}
		}
	}
}
print "done\n";

#print "* Pushing karaoke data to CouchDB:\n";
print "* Making karaoke list:\n";
my $json_list = [];
my $id = 1;
for my $lc_artist (sort keys %$results) {
	for my $song (sort { lc($a) cmp lc($b) } @{$results->{$lc_artist}->{'songs'}}) {
		push(@{$json_list}, [$id++, $results->{$lc_artist}->{'display_name'}, $song]);
#		my $artist_id = $lc_artist;
#		$artist_id =~ s/[^[:alnum:]]//g;
#
#		my $song_id = lc($song);
#		$song_id =~ s/[^[:alnum:]]//g;
#
#		my $id = 'karaoke:2015:' . $lc_artist . "\N{U+2603}" . lc($song);
#		#print "$artist_id-$song_id - ", $results->{$lc_artist}->{'display_name'}, " - ", $song, "\n";
#
#		print "  - Checking for existing '$id'... ";
#		if (exists $existing->{$id}) {
#			print "yup\n";
#			delete $existing->{$id};
#		} else {
#			print "missing\n";
#			print "  - Creating '$id'... ";
#			my ($id, $rev) = $db->put_doc({
#				doc => {
#					'_id'    => $id,
#					'type'   => 'karaoke',
#					'artist' => $results->{$lc_artist}->{'display_name'},
#					'song'   => $song
#				},
#				dbname => 'karaoke'
#			});
#			if ($db->has_error) {
#				if ($db->error =~ '409 Conflict') {
#					# good enough
#					print "done\n";
#				} else {
#					die "failed to save song: " . $db->error . "\n";
#				}
#			} else {
#				print "done\n";
#			}
#		}
	}
}

#print "* Deleting removed entries... ";
#for my $id (keys %$existing) {
#	print $id, " ";
#	$db->del_doc({ '_id' => $id });
#}
#print "done\n";
#exit(0);

my $json = JSON::PP->new();
my $json_text = $json->encode($json_list);

print "Found " . scalar(@{$json_list}) . " entries.  Writing them to disk... ";
open (FILEOUT, '>www/scripts/cruisemonkey/karaoke-list.js') or die "Can't write to karaoke-list.js: $!\n";
print FILEOUT $json_text;
close (FILEOUT);
print "done\n";
